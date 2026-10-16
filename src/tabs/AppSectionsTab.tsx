import React, { useState, useRef, useEffect } from 'react';
import { useAppContext, type AppSection } from '../context/AppContext';
import { Plus, Upload, X } from 'lucide-react';
import { CustomSelect } from '../components/CustomSelect';
import { RowActions } from '../components/RowActions';
import { ImagePreviewModal } from '../components/ImagePreviewModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { compressImage, getImageUrl } from '../utils/imageUtils';
import { SelectCafeDialog } from '../components/SelectCafeDialog';

export const AppSectionsTab: React.FC = () => {
  const {
    appSections,
    addAppSection,
    updateAppSection,
    deleteAppSection,
    menuItems,
    cloudCafes,
    getTakenOrders,
  } = useAppContext();

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<AppSection | null>(null);

  // Image preview state
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Select Cafe state
  const [selectCafeTarget, setSelectCafeTarget] = useState<AppSection | null>(null);

  // Wizard state
  const [step, setStep] = useState(1);
  const [section_name, setSectionName] = useState('');
  const [section_color, setSectionColor] = useState('');
  const [section_banner_1, setSectionBanner1] = useState('');
  const [section_banner_2, setSectionBanner2] = useState('');
  const [section_banner_3, setSectionBanner3] = useState('');
  const [section_order, setSectionOrder] = useState<number | 'hero'>();
  const [section_visibility, setSectionVisibility] = useState<string>('all');
  const [section_menu, setSectionMenu] = useState<string[]>([]);
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const fileInputRef3 = useRef<HTMLInputElement>(null);

  const processFile = async (file: File, bannerNum: 1 | 2 | 3) => {
    try {
      const compressedBase64 = await compressImage(file);
      if (bannerNum === 1) setSectionBanner1(compressedBase64);
      if (bannerNum === 2) setSectionBanner2(compressedBase64);
      if (bannerNum === 3) setSectionBanner3(compressedBase64);
    } catch (err) {
      console.error('Error compressing image:', err);
    }
  };

  const handleFileUpload = (bannerNum: 1 | 2 | 3) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, bannerNum);
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isWizardOpen) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            if (section_order === 'hero' && step === 1) {
              if (!section_banner_1) processFile(file, 1);
              else if (!section_banner_2) processFile(file, 2);
              else if (!section_banner_3) processFile(file, 3);
              else processFile(file, 3); // Overwrite last if full
            } else if (step === 3 || step === 1) {
              processFile(file, 1);
            }
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isWizardOpen, step, section_order, section_banner_1, section_banner_2, section_banner_3]);

  const handleDrop = (bannerNum: 1 | 2 | 3) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file, bannerNum);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const resetForm = () => {
    setStep(1);
    setSectionName('');
    setSectionColor('');
    setSectionBanner1('');
    setSectionBanner2('');
    setSectionBanner3('');
    setSectionOrder(undefined);
    setSectionVisibility('all');
    setSectionMenu([]);
    setIsWizardOpen(false);
    setEditingId(null);
  };

  const openAdd = () => {
    resetForm();
    setIsWizardOpen(true);
  };

  const openEdit = (section: AppSection) => {
    setEditingId(section.id);
    setSectionName(section.section_name);
    setSectionColor(section.section_color);
    setSectionBanner1(section.section_banner_1 || '');
    setSectionBanner2((section as any).section_banner_2 || '');
    setSectionBanner3((section as any).section_banner_3 || '');
    setSectionOrder(section.section_order === 0 ? 'hero' : section.section_order);
    setSectionVisibility(section.section_visibility || 'all');
    setSectionMenu(section.section_menu || []);
    setStep(1);
    setIsWizardOpen(true);
  };

  const handleSave = () => {
    const data = {
      section_name: section_order === 'hero' ? 'Hero Banner' : section_name,
      section_color: section_order === 'hero' ? '#FFFFFF' : section_color,
      section_banner_1: section_banner_1 || 'https://via.placeholder.com/600x200',
      section_banner_2: section_order === 'hero' ? section_banner_2 : undefined,
      section_banner_3: section_order === 'hero' ? section_banner_3 : undefined,
      section_menu: section_order === 'hero' ? [] : section_menu,
      section_order: section_order === 'hero' ? 0 : section_order,
      section_visibility,
    } as any;
    if (editingId) {
      updateAppSection(editingId, data);
    } else {
      addAppSection(data);
    }
    resetForm();
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteAppSection(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const toggleMenuItem = (id: string) => {
    setSectionMenu((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const takenOrders = getTakenOrders(editingId ?? undefined);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">App Sections</h1>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={18} /> Add Section
        </button>
      </div>

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Banner</th>
              <th>Name</th>
              <th>Color</th>
              <th>Visibility</th>
              <th>Items Linked</th>
              <th style={{ width: 48 }}></th>
            </tr>
          </thead>
          <tbody>
            {appSections.sort((a, b) => {
              const orderA = a.section_order === 0 ? -1 : a.section_order;
              const orderB = b.section_order === 0 ? -1 : b.section_order;
              return orderA - orderB;
            }).map((section) => (
              <tr key={section.id}>
                <td>{section.section_order === 0 ? 'Hero Banner' : section.section_order}</td>
                <td>
                  <img
                    src={section.section_banner_1}
                    alt={section.section_name}
                    className="table-thumbnail"
                    style={{ width: 60, height: 30, borderRadius: 4, objectFit: 'cover' }}
                    onClick={() => setPreviewImage(section.section_banner_1)}
                  />
                </td>
                <td>{section.section_name}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: section.section_color }} />
                    {section.section_color}
                  </div>
                </td>
                <td>
                  <CustomSelect
                    options={[
                      { label: 'All', value: 'all' },
                      { label: 'None', value: 'none' },
                      { label: 'Select Cafe', value: 'select_cafe' },
                    ]}
                    value={['all', 'none'].includes(section.section_visibility) ? section.section_visibility : 'select_cafe'}
                    onChange={(val) => {
                      if (val === 'select_cafe') {
                        setSelectCafeTarget(section);
                      } else {
                        updateAppSection(section.id, { section_visibility: val as string });
                      }
                    }}
                  />
                </td>
                <td>{section.section_menu.length} items</td>
                <td>
                  <RowActions
                    onEdit={() => openEdit(section)}
                    onDelete={() => setDeleteTarget(section)}
                  />
                </td>
              </tr>
            ))}
            {appSections.length === 0 && (
              <tr className="empty-state">
                <td colSpan={7}>
                  No app sections found. Click "Add Section" to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Image Preview */}
      {previewImage && (
        <ImagePreviewModal src={previewImage} onClose={() => setPreviewImage(null)} />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <DeleteConfirmModal
          title="Delete App Section"
          message={`Are you sure you want to delete "${deleteTarget.section_name}"? This action cannot be undone.`}
          onCancel={() => setDeleteTarget(null)}
          onDelete={handleDeleteConfirm}
        />
      )}

      {/* Select Cafe Dialog */}
      {selectCafeTarget && (
        <SelectCafeDialog
          cafes={cloudCafes}
          selectedIds={['all', 'none'].includes(selectCafeTarget.section_visibility) ? [] : selectCafeTarget.section_visibility.split(',').filter(Boolean)}
          onClose={() => setSelectCafeTarget(null)}
          onSave={(ids) => {
            updateAppSection(selectCafeTarget.id, { section_visibility: ids.join(',') });
            setSelectCafeTarget(null);
          }}
        />
      )}

      {/* Add/Edit Wizard */}
      {isWizardOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2 className="modal-title">{editingId ? 'Edit App Section' : 'Add App Section'}</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={resetForm}>
                <X size={24} color="var(--color-text-secondary)" />
              </button>
            </div>

            <div className="wizard-steps">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className={`wizard-step-dot ${step >= s ? 'active' : ''}`} />
              ))}
            </div>

            <div className="modal-body">
              {/* Step 1: Order selection */}
              {step === 1 && (
                <div className="form-group">
                  <label className="form-label">Section Order</label>
                  <CustomSelect
                    options={[
                      { 
                        label: `Hero Banner${takenOrders.includes(0) ? ' (Taken)' : ''}`, 
                        value: 'hero',
                        disabled: takenOrders.includes(0) 
                      },
                      ...Array.from({ length: 10 }, (_, i) => ({
                        label: `${i + 1}${takenOrders.includes(i + 1) ? ' (Taken)' : ''}`,
                        value: i + 1,
                        disabled: takenOrders.includes(i + 1),
                      })),
                    ]}
                    value={section_order ?? ''}
                    onChange={(val) => setSectionOrder(val as any)}
                  />
                </div>
              )}

              {/* If hero banner selected, skip remaining steps */}
              {step === 1 && section_order === 'hero' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Banner Image 1</label>
                    <input type="file" accept="image/*" ref={fileInputRef1} onChange={handleFileUpload(1)} style={{ display: 'none' }} />
                    <div 
                      className="upload-zone" 
                      onClick={() => fileInputRef1.current?.click()}
                      onDrop={handleDrop(1)}
                      onDragOver={handleDragOver}
                    >
                      {section_banner_1 ? (
                        <img src={section_banner_1} alt="Preview" style={{ width: '100%', maxHeight: 120, objectFit: 'contain' }} />
                      ) : (
                        <>
                          <Upload size={24} color="var(--color-primary)" />
                          <span className="upload-zone-text">Click to upload banner 1</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Banner Image 2</label>
                    <input type="file" accept="image/*" ref={fileInputRef2} onChange={handleFileUpload(2)} style={{ display: 'none' }} />
                    <div 
                      className="upload-zone" 
                      onClick={() => fileInputRef2.current?.click()}
                      onDrop={handleDrop(2)}
                      onDragOver={handleDragOver}
                    >
                      {section_banner_2 ? (
                        <img src={section_banner_2} alt="Preview" style={{ width: '100%', maxHeight: 120, objectFit: 'contain' }} />
                      ) : (
                        <>
                          <Upload size={24} color="var(--color-primary)" />
                          <span className="upload-zone-text">Click to upload banner 2</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Banner Image 3</label>
                    <input type="file" accept="image/*" ref={fileInputRef3} onChange={handleFileUpload(3)} style={{ display: 'none' }} />
                    <div 
                      className="upload-zone" 
                      onClick={() => fileInputRef3.current?.click()}
                      onDrop={handleDrop(3)}
                      onDragOver={handleDragOver}
                    >
                      {section_banner_3 ? (
                        <img src={section_banner_3} alt="Preview" style={{ width: '100%', maxHeight: 120, objectFit: 'contain' }} />
                      ) : (
                        <>
                          <Upload size={24} color="var(--color-primary)" />
                          <span className="upload-zone-text">Click to upload banner 3</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Name & Color (skip if hero) */}
              {step === 2 && section_order !== 'hero' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Section Name</label>
                    <input className="form-input" value={section_name} onChange={(e) => setSectionName(e.target.value)} placeholder="e.g. Featured Drinks" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Choose Color</label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ position: 'relative', width: 40, height: 40, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                        <input
                          type="color"
                          value={section_color || '#000000'}
                          onChange={(e) => setSectionColor(e.target.value)}
                          style={{ position: 'absolute', top: -10, left: -10, width: 60, height: 60, cursor: 'pointer', padding: 0, border: 'none' }}
                        />
                      </div>
                      <input className="form-input" style={{ flex: 1 }} value={section_color} onChange={(e) => setSectionColor(e.target.value)} placeholder="#FFFFFF" />
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Banner upload (skip if hero) */}
              {step === 3 && section_order !== 'hero' && (
                <div className="form-group">
                  <label className="form-label">Upload Banner (PNG)</label>
                  <input type="file" accept="image/png, image/jpeg" ref={fileInputRef1} onChange={handleFileUpload(1)} style={{ display: 'none' }} />
                  <div 
                    className="upload-zone" 
                    onClick={() => fileInputRef1.current?.click()}
                    onDrop={handleDrop(1)}
                    onDragOver={handleDragOver}
                  >
                    {section_banner_1 ? (
                      <img src={section_banner_1} alt="Preview" style={{ width: '100%', maxHeight: 120, objectFit: 'contain' }} />
                    ) : (
                      <>
                        <Upload size={24} color="var(--color-primary)" />
                        <span className="upload-zone-text">Click to upload banner</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Visibility selection */}
              {step === 4 && section_order !== 'hero' && (
                <div className="form-group">
                  <label className="form-label">Visibility</label>
                  <CustomSelect
                    options={[
                      { label: 'All', value: 'all' },
                      { label: 'None', value: 'none' },
                      { label: 'Select Cafe', value: 'select_cafe' },
                    ]}
                    value={['all', 'none'].includes(section_visibility) ? section_visibility : 'select_cafe'}
                    onChange={(val) => {
                      setSectionVisibility(val as string);
                      if (val === 'select_cafe') {
                        // In the wizard, we just set it to select_cafe. The user can refine it from the table later, 
                        // or we could open the dialog here. For simplicity, setting to 'select_cafe' acts as a placeholder 
                        // until they select specific ones. Or we can just leave it as 'select_cafe' string and let them edit later.
                      }
                    }}
                  />
                </div>
              )}

              {/* Step 5: Menu items selection (skip if hero) */}
              {step === 5 && section_order !== 'hero' && (
                <div className="form-group">
                  <label className="form-label">Select Menu Items</label>
                  {menuItems.length === 0 ? (
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>No menu items available. Please add items in the Menu tab first.</p>
                  ) : (
                    <div className="multi-select-grid" style={{ maxHeight: 200, overflowY: 'auto' }}>
                      {menuItems.map((item) => (
                        <div
                          key={item.id}
                          className={`multi-select-item ${section_menu.includes(item.id) ? 'selected' : ''}`}
                          onClick={() => toggleMenuItem(item.id)}
                        >
                          <img src={getImageUrl(item.image)} alt={item.coffee_name} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                          <div style={{ fontSize: 12, fontWeight: 500 }}>{item.coffee_name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              {step > 1 && (
                <button className="btn-secondary" onClick={() => setStep((s) => s - 1)}>
                  Back
                </button>
              )}
              {section_order !== 'hero' && step < 5 && (
                <button className="btn-primary" onClick={() => setStep((s) => s + 1)} disabled={(step === 1 && !section_order) || (step === 2 && !section_name) || (step === 3 && !section_banner_1)}>
                  Next
                </button>
              )}
              {section_order === 'hero' && step === 1 && (
                <button className="btn-primary" onClick={handleSave} disabled={!section_banner_1 || !section_banner_2 || !section_banner_3}>
                  Save Hero Section
                </button>
              )}
              {section_order !== 'hero' && step === 5 && (
                <button className="btn-primary" onClick={handleSave} disabled={takenOrders.includes(section_order as any)}>
                  {editingId ? 'Save Changes' : 'Save Section'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

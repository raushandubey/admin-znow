import React, { useState, useRef, useEffect } from 'react';
import { useAppContext, type CategoryType, type MenuItem } from '../context/AppContext';
import { Plus, Upload, X } from 'lucide-react';
import { CustomSelect } from '../components/CustomSelect';
import { RowActions } from '../components/RowActions';
import { ImagePreviewModal } from '../components/ImagePreviewModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { validatePngFile, optimizeImageToPngBlob, getImageUrl } from '../utils/imageUtils';
import { uploadMenuImage, deleteMenuImage } from '../utils/menuImageService';

export const MenuTab: React.FC = () => {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useAppContext();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  // Image preview state
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Wizard state
  const [step, setStep] = useState(1);
  const [image, setImage] = useState(''); // Stores DB path/URL if editing
  const [pendingImageBlob, setPendingImageBlob] = useState<Blob | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [coffee_name, setCoffeeName] = useState('');
  const [coffee_type, setCoffeeType] = useState<CategoryType | string>('Cold Coffee');
  const [regular_quantity, setRegularQuantity] = useState('');
  const [large_quantity, setLargeQuantity] = useState('');
  const [regular_price, setRegularPrice] = useState('');
  const [large_price, setLargePrice] = useState('');
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setUploadError(null);
    const validation = validatePngFile(file);
    if (!validation.valid) {
      const errMsg = validation.error || 'Only PNG images are supported.';
      setUploadError(errMsg);
      alert(errMsg);
      return;
    }

    try {
      const pngBlob = await optimizeImageToPngBlob(file);
      setPendingImageBlob(pngBlob);
      const previewUrl = URL.createObjectURL(pngBlob);
      setImagePreviewUrl(previewUrl);
    } catch (err: any) {
      console.error('Error optimizing image:', err);
      const errMsg = err.message || 'Failed to process image.';
      setUploadError(errMsg);
      alert(errMsg);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isWizardOpen || step !== 1) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isWizardOpen, step]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleNext = () => setStep((s) => s + 1);
  const resetForm = () => {
    setStep(1);
    setImage('');
    setPendingImageBlob(null);
    setImagePreviewUrl('');
    setUploadError(null);
    setIsSubmitting(false);
    setCoffeeName('');
    setCoffeeType('Cold Coffee');
    setRegularQuantity('');
    setLargeQuantity('');
    setRegularPrice('');
    setLargePrice('');
    setDescription('');
    setIsWizardOpen(false);
    setEditingId(null);
  };

  const openAdd = () => {
    resetForm();
    setIsWizardOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setImage(item.image);
    setPendingImageBlob(null);
    setImagePreviewUrl(getImageUrl(item.image));
    setUploadError(null);
    setIsSubmitting(false);
    setCoffeeName(item.coffee_name);
    setCoffeeType(item.coffee_type);
    setRegularQuantity(item.regular_quantity || '');
    setLargeQuantity(item.large_quantity || '');
    setRegularPrice(item.regular_price ? String(item.regular_price) : '');
    setLargePrice(item.large_price ? String(item.large_price) : '');
    setDescription(item.description);
    setStep(1);
    setIsWizardOpen(true);
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setUploadError(null);

    let finalImagePath = image;
    let newlyUploadedPath: string | null = null;

    try {
      if (pendingImageBlob) {
        try {
          const uploadRes = await uploadMenuImage(pendingImageBlob, coffee_name);
          finalImagePath = uploadRes.storagePath;
          newlyUploadedPath = uploadRes.storagePath;
        } catch (err: any) {
          const errMsg = err.message || 'Image upload to storage failed.';
          setUploadError(errMsg);
          alert(errMsg);
          setIsSubmitting(false);
          return;
        }
      } else if (!editingId && !finalImagePath) {
        const errMsg = 'Please select a PNG image for the menu item.';
        setUploadError(errMsg);
        alert(errMsg);
        setIsSubmitting(false);
        return;
      }

      const data = {
        coffee_name,
        coffee_type,
        regular_quantity,
        large_quantity,
        regular_price: Number(regular_price),
        large_price: Number(large_price),
        description,
        image: finalImagePath || 'https://via.placeholder.com/150',
      };

      if (editingId) {
        const existingItem = menuItems.find((m) => m.id === editingId);
        try {
          await updateMenuItem(editingId, data);
        } catch (dbErr: any) {
          if (newlyUploadedPath) {
            await deleteMenuImage(newlyUploadedPath);
          }
          setIsSubmitting(false);
          return;
        }

        if (newlyUploadedPath && existingItem?.image && existingItem.image !== newlyUploadedPath) {
          await deleteMenuImage(existingItem.image);
        }
      } else {
        try {
          await addMenuItem(data);
        } catch (dbErr: any) {
          if (newlyUploadedPath) {
            await deleteMenuImage(newlyUploadedPath);
          }
          setIsSubmitting(false);
          return;
        }
      }

      resetForm();
    } catch (err: any) {
      console.error('Save menu item error:', err);
      alert(err.message || 'An error occurred while saving.');
      if (newlyUploadedPath) {
        await deleteMenuImage(newlyUploadedPath);
      }
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteMenuItem(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const displayPreview = imagePreviewUrl || (image ? getImageUrl(image) : '');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Menu Management</h1>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={18} /> Add Item
        </button>
      </div>

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Sizes (ml)</th>
              <th>Prices (₹)</th>
              <th style={{ width: 48 }}></th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => {
              const fullImageUrl = getImageUrl(item.image);
              return (
                <tr key={item.id}>
                  <td>
                    <img
                      src={fullImageUrl}
                      alt={item.coffee_name}
                      className="table-thumbnail"
                      style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                      onClick={() => setPreviewImage(fullImageUrl)}
                    />
                  </td>
                  <td>{item.coffee_name}</td>
                  <td>{item.coffee_type}</td>
                  <td>
                    <div>Reg: {item.regular_quantity} ml</div>
                    <div>Lrg: {item.large_quantity} ml</div>
                  </td>
                  <td>
                    <div>Reg: ₹{item.regular_price}</div>
                    <div>Lrg: ₹{item.large_price}</div>
                  </td>
                  <td>
                    <RowActions
                      onEdit={() => openEdit(item)}
                      onDelete={() => setDeleteTarget(item)}
                    />
                  </td>
                </tr>
              );
            })}
            {menuItems.length === 0 && (
              <tr className="empty-state">
                <td colSpan={6}>
                  No items in menu. Click "Add Item" to start.
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
          title="Delete Menu Item"
          message={`Are you sure you want to delete "${deleteTarget.coffee_name}"? This action cannot be undone.`}
          onCancel={() => setDeleteTarget(null)}
          onDelete={handleDeleteConfirm}
        />
      )}

      {/* Add/Edit Wizard */}
      {isWizardOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2 className="modal-title">{editingId ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={resetForm} disabled={isSubmitting}>
                <X size={24} color="var(--color-text-secondary)" />
              </button>
            </div>

            <div className="wizard-steps">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className={`wizard-step-dot ${step >= s ? 'active' : ''}`} />
              ))}
            </div>

            <div className="modal-body">
              {step === 1 && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Upload Image</label>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
                    <div 
                      className="upload-zone" 
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    >
                      {displayPreview ? (
                        <img src={displayPreview} alt="Preview" style={{ width: '100%', maxHeight: 120, objectFit: 'contain' }} />
                      ) : (
                        <>
                          <Upload size={24} color="var(--color-primary)" />
                          <span className="upload-zone-text">Click, drag, or paste image here</span>
                        </>
                      )}
                    </div>
                    {uploadError && (
                      <p style={{ color: '#ef4444', fontSize: 13, marginTop: 6 }}>{uploadError}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Item Name</label>
                    <input className="form-input" value={coffee_name} onChange={(e) => setCoffeeName(e.target.value)} placeholder="e.g. Vanilla Latte" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <CustomSelect
                    options={[
                      { label: 'Cold Coffee', value: 'Cold Coffee' },
                      { label: 'Hot Coffee', value: 'Hot Coffee' },
                      { label: 'Flavored Coffee', value: 'Flavored Coffee' }
                    ]}
                    value={coffee_type}
                    onChange={(val) => setCoffeeType(val as CategoryType)}
                  />
                </div>
              )}

              {step === 3 && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Regular Size Quantity (ml)</label>
                    <input className="form-input" type="number" value={regular_quantity} onChange={(e) => setRegularQuantity(e.target.value)} placeholder="e.g. 250" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Large Size Quantity (ml)</label>
                    <input className="form-input" type="number" value={large_quantity} onChange={(e) => setLargeQuantity(e.target.value)} placeholder="e.g. 350" />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Regular Size Price (₹)</label>
                    <input className="form-input" type="number" value={regular_price} onChange={(e) => setRegularPrice(e.target.value)} placeholder="149" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Large Size Price (₹)</label>
                    <input className="form-input" type="number" value={large_price} onChange={(e) => setLargePrice(e.target.value)} placeholder="199" />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="form-group">
                  <label className="form-label">Product Description</label>
                  <textarea className="form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the item..." />
                </div>
              )}
            </div>

            <div className="modal-footer">
              {step > 1 && (
                <button className="btn-secondary" onClick={() => setStep((s) => s - 1)} disabled={isSubmitting}>
                  Back
                </button>
              )}
              {step < 5 ? (
                <button className="btn-primary" onClick={handleNext} disabled={step === 1 && !coffee_name}>
                  Next
                </button>
              ) : (
                <button className="btn-primary" onClick={handleSave} disabled={!description || isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Save Item'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


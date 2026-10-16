import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { deleteMenuImage } from '../utils/menuImageService';

export type CategoryType = 'Cold Coffee' | 'Hot Coffee' | 'Flavored Coffee';

export interface MenuItem {
  id: string;
  coffee_name: string;
  coffee_type: CategoryType | string;
  regular_quantity: string;
  large_quantity: string;
  regular_price: number;
  large_price: number;
  description: string;
  image: string; 
}

export interface CloudCafe {
  id: string;
  longitude: number;
  latitude: number;
  area: string;
  city: string;
  state: string;
  pin_code: string;
  cafe_name: string;
  cafe_unique_id: string;
  status: 'open' | 'closed';
}

export interface AppSection {
  id: string;
  section_name: string;
  section_color: string;
  section_banner_1: string;
  section_banner_2?: string;
  section_banner_3?: string;
  section_menu: string[];
  section_order: number;
  section_visibility: string;
}

interface AppContextType {
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  
  cloudCafes: CloudCafe[];
  addCloudCafe: (cafe: Omit<CloudCafe, 'id' | 'status'>) => Promise<void>;
  updateCloudCafe: (id: string, cafe: Partial<CloudCafe>) => Promise<void>;
  deleteCloudCafe: (id: string) => Promise<void>;
  toggleCafeStatus: (id: string) => Promise<void>;

  appSections: AppSection[];
  addAppSection: (section: Omit<AppSection, 'id'>) => Promise<void>;
  updateAppSection: (id: string, section: Partial<AppSection>) => Promise<void>;
  deleteAppSection: (id: string) => Promise<void>;
  
  getTakenOrders: (excludeId?: string) => number[];
  
  loading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cloudCafes, setCloudCafes] = useState<CloudCafe[]>([]);
  const [appSections, setAppSections] = useState<AppSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [menuRes, cafesRes, sectionsRes] = await Promise.all([
        supabase.from('menu').select('*'),
        supabase.from('cloud_cafes').select('*'),
        supabase.from('app_sections').select('*')
      ]);

      if (menuRes.error) throw menuRes.error;
      if (cafesRes.error) throw cafesRes.error;
      if (sectionsRes.error) throw sectionsRes.error;

      setMenuItems(menuRes.data as MenuItem[]);
      setCloudCafes(cafesRes.data as CloudCafe[]);
      setAppSections(sectionsRes.data as AppSection[]);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    const { data, error } = await supabase.from('menu').insert([item]).select().single();
    if (error) {
      console.error(error);
      alert(`Failed to save menu item: ${error.message}`);
      throw error;
    }
    setMenuItems((prev) => [...prev, data as MenuItem]);
  };

  const updateMenuItem = async (id: string, item: Partial<MenuItem>) => {
    const { data, error } = await supabase.from('menu').update(item).eq('id', id).select().single();
    if (error) {
      console.error(error);
      alert(`Failed to update menu item: ${error.message}`);
      throw error;
    }
    setMenuItems((prev) => prev.map((m) => (m.id === id ? data as MenuItem : m)));
  };

  const deleteMenuItem = async (id: string) => {
    const targetItem = menuItems.find((m) => m.id === id);
    const { error } = await supabase.from('menu').delete().eq('id', id);
    if (error) {
      console.error(error);
      alert(`Failed to delete menu item: ${error.message}`);
      throw error;
    }
    if (targetItem?.image) {
      await deleteMenuImage(targetItem.image);
    }
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
  };

  const addCloudCafe = async (cafe: Omit<CloudCafe, 'id' | 'status'>) => {
    const { data, error } = await supabase.from('cloud_cafes').insert([{ ...cafe, status: 'closed' }]).select().single();
    if (error) {
      console.error(error);
      alert(`Failed to save cafe: ${error.message}`);
      throw error;
    }
    setCloudCafes((prev) => [...prev, data as CloudCafe]);
  };

  const updateCloudCafe = async (id: string, cafe: Partial<CloudCafe>) => {
    const { data, error } = await supabase.from('cloud_cafes').update(cafe).eq('id', id).select().single();
    if (error) {
      console.error(error);
      alert(`Failed to update cafe: ${error.message}`);
      throw error;
    }
    setCloudCafes((prev) => prev.map((c) => (c.id === id ? data as CloudCafe : c)));
  };

  const deleteCloudCafe = async (id: string) => {
    const { error } = await supabase.from('cloud_cafes').delete().eq('id', id);
    if (error) {
      console.error(error);
      alert(`Failed to delete cafe: ${error.message}`);
      throw error;
    }
    setCloudCafes((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleCafeStatus = async (id: string) => {
    const cafe = cloudCafes.find(c => c.id === id);
    if (!cafe) return;
    const newStatus = cafe.status === 'open' ? 'closed' : 'open';
    const { data, error } = await supabase.from('cloud_cafes').update({ status: newStatus }).eq('id', id).select().single();
    if (error) {
      console.error(error);
      alert(`Failed to toggle cafe status: ${error.message}`);
      throw error;
    }
    setCloudCafes((prev) => prev.map((c) => (c.id === id ? data as CloudCafe : c)));
  };

  const addAppSection = async (section: Omit<AppSection, 'id'>) => {
    const { data, error } = await supabase.from('app_sections').insert([section]).select().single();
    if (error) {
      console.error(error);
      alert(`Failed to save app section: ${error.message}`);
      throw error;
    }
    setAppSections((prev) => [...prev, data as AppSection]);
  };

  const updateAppSection = async (id: string, section: Partial<AppSection>) => {
    const { data, error } = await supabase.from('app_sections').update(section).eq('id', id).select().single();
    if (error) {
      console.error(error);
      alert(`Failed to update app section: ${error.message}`);
      throw error;
    }
    setAppSections((prev) => prev.map((s) => (s.id === id ? data as AppSection : s)));
  };

  const deleteAppSection = async (id: string) => {
    const { error } = await supabase.from('app_sections').delete().eq('id', id);
    if (error) {
      console.error(error);
      alert(`Failed to delete app section: ${error.message}`);
      throw error;
    }
    setAppSections((prev) => prev.filter((s) => s.id !== id));
  };

  const getTakenOrders = (excludeId?: string) => {
    return appSections.filter(s => s.id !== excludeId).map((s) => s.section_order);
  };

  return (
    <AppContext.Provider
      value={{
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        cloudCafes,
        addCloudCafe,
        updateCloudCafe,
        deleteCloudCafe,
        toggleCafeStatus,
        appSections,
        addAppSection,
        updateAppSection,
        deleteAppSection,
        getTakenOrders,
        loading,
        error
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

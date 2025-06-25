
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjlgkkjkhhpnxtohisxi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqbGdra2praGhwbnh0b2hpc3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MzExMTQsImV4cCI6MjA2NjQwNzExNH0.9iwBV1wZuwLg4adB4b4FCFqyzJUfNib0QSBLuocW2sw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadFile = async (file: File, bucket: string = 'chat-files') => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return {
    path: data.path,
    url: publicUrl,
    fullPath: data.fullPath
  };
};

export const deleteFile = async (path: string, bucket: string = 'chat-files') => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw error;
  }
};

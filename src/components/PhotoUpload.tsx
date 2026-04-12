import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Camera, Loader2 } from 'lucide-react';

interface PhotoUploadProps {
  userId: string;
  currentPhotoUrl: string | null;
  fullName: string;
  onUploadComplete: (url: string) => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ userId, currentPhotoUrl, fullName, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      await supabase.from('profiles').update({ photo_url: publicUrl }).eq('id', userId);

      onUploadComplete(publicUrl);
    } catch (err: any) {
      setError('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
      <div className="w-36 rounded-lg bg-blue-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 overflow-hidden self-stretch min-h-[100px]">
        {currentPhotoUrl
          ? <img src={currentPhotoUrl} alt={fullName} className="w-full h-full object-cover" />
          : <span>{fullName.charAt(0).toUpperCase() || '?'}</span>
        }
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-1">
          {uploading
            ? <Loader2 className="w-6 h-6 text-white animate-spin" />
            : <>
                <Camera className="w-6 h-6 text-white" />
                <span className="text-white text-xs font-medium">Change photo</span>
              </>
          }
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        className="hidden"
        disabled={uploading}
      />
      {error && <p className="text-red-400 text-xs mt-1 absolute -bottom-5 left-0 whitespace-nowrap">{error}</p>}
    </div>
  );
};

export default PhotoUpload;

/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
import React from 'react';
import { MapPin, Phone, Globe } from 'lucide-react';

interface NAPDisplayProps {
  name: string;
  address?: string;
  phone?: string;
  area?: string;
  className?: string;
}

export default function NAPDisplay({ name, address, phone, area, className = "" }: NAPDisplayProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{name}</h1>
      
      {address && (
        <div className="flex items-center gap-2 text-text-muted">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm md:text-base">{address}{area ? ` - ${area}` : ''}</span>
        </div>
      )}

      {phone && (
        <div className="flex items-center gap-2 text-text-muted">
          <Phone className="w-4 h-4 text-primary" />
          <span className="text-sm md:text-base dir-ltr text-left inline-block">{phone}</span>
        </div>
      )}
    </div>
  );
}

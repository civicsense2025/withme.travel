"use client";

import { type ColumnDef } from '@tanstack/react-table';
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { type Database } from '@/types/supabase';
type Destination = Database['public']['Tables']['destinations']['Row'];

export const columns: ColumnDef<Destination>[] = [
  {
    accessorKey: 'city',
    header: 'City',
  },
  {
    accessorKey: 'country',
    header: 'Country',
  },
  {
    accessorKey: 'continent',
    header: 'Continent',
  },
  {
    accessorKey: 'image_url',
    header: 'Image',
    cell: ({ row }) => (
      row.getValue('image_url') ? (
        <img 
          src={row.getValue('image_url')} 
          alt={`${row.getValue('city')}`} 
          className="h-10 w-10 object-cover rounded-md" 
        />
      ) : (
        <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
          No img
        </div>
      )
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const destination = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // TODO: Implement edit functionality
              console.log('Edit destination:', destination);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              // TODO: Implement delete functionality
              console.log('Delete destination:', destination);
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
]; 
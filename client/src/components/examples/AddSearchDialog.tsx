import AddSearchDialog from '../AddSearchDialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function AddSearchDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6">
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <AddSearchDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={(data) => console.log('Submitted:', data)}
      />
    </div>
  );
}

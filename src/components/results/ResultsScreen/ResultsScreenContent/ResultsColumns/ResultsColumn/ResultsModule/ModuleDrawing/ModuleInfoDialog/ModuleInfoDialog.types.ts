export interface ModuleInfoDialogProps {
  title?: string; // the title of the module. Absent = the dialog is named "Informacje"
  description?: string; // the explanation written by the quiz author
  isOpen: boolean;
  onClose: () => void;
}

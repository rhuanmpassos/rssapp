import { useState, useCallback } from 'react';

interface DialogButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface DialogConfig {
  title: string;
  message: string;
  buttons: DialogButton[];
}

export function useDialog() {
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);

  const showDialog = useCallback((config: DialogConfig) => {
    setDialogConfig(config);
  }, []);

  const hideDialog = useCallback(() => {
    setDialogConfig(null);
  }, []);

  const showAlert = useCallback(
    (title: string, message: string, buttons?: DialogButton[]) => {
      showDialog({
        title,
        message,
        buttons: buttons || [{ text: 'OK', onPress: hideDialog }],
      });
    },
    [showDialog, hideDialog]
  );

  return {
    dialogConfig,
    showDialog,
    hideDialog,
    showAlert,
  };
}

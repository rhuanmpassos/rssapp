import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CustomDialog } from '../components/CustomDialog';

interface DialogButton {
  text: string;
  onPress?: () => void | Promise<void>;
  style?: 'default' | 'cancel' | 'destructive';
}

interface DialogConfig {
  title: string;
  message: string;
  buttons: DialogButton[];
}

interface DialogContextType {
  showAlert: (title: string, message: string, buttons?: DialogButton[]) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    options?: {
      confirmText?: string;
      cancelText?: string;
      confirmStyle?: 'default' | 'destructive';
    }
  ) => void;
  showSuccess: (title: string, message: string, onDismiss?: () => void) => void;
  showError: (title: string, message: string, onDismiss?: () => void) => void;
  hideDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

interface DialogProviderProps {
  children: ReactNode;
}

export function DialogProvider({ children }: DialogProviderProps) {
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);

  const hideDialog = useCallback(() => {
    setDialogConfig(null);
  }, []);

  const showAlert = useCallback(
    (title: string, message: string, buttons?: DialogButton[]) => {
      setDialogConfig({
        title,
        message,
        buttons: buttons || [{ text: 'OK', onPress: () => setDialogConfig(null) }],
      });
    },
    []
  );

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void | Promise<void>,
      options?: {
        confirmText?: string;
        cancelText?: string;
        confirmStyle?: 'default' | 'destructive';
      }
    ) => {
      setDialogConfig({
        title,
        message,
        buttons: [
          {
            text: options?.cancelText || 'Cancelar',
            style: 'cancel',
            onPress: () => setDialogConfig(null),
          },
          {
            text: options?.confirmText || 'Confirmar',
            style: options?.confirmStyle || 'default',
            onPress: async () => {
              await onConfirm();
              setDialogConfig(null);
            },
          },
        ],
      });
    },
    []
  );

  const showSuccess = useCallback(
    (title: string, message: string, onDismiss?: () => void) => {
      setDialogConfig({
        title,
        message,
        buttons: [
          {
            text: 'OK',
            onPress: () => {
              setDialogConfig(null);
              onDismiss?.();
            },
          },
        ],
      });
    },
    []
  );

  const showError = useCallback(
    (title: string, message: string, onDismiss?: () => void) => {
      setDialogConfig({
        title,
        message,
        buttons: [
          {
            text: 'OK',
            onPress: () => {
              setDialogConfig(null);
              onDismiss?.();
            },
          },
        ],
      });
    },
    []
  );

  return (
    <DialogContext.Provider
      value={{
        showAlert,
        showConfirm,
        showSuccess,
        showError,
        hideDialog,
      }}
    >
      {children}
      {dialogConfig && (
        <CustomDialog
          visible={true}
          title={dialogConfig.title}
          message={dialogConfig.message}
          buttons={dialogConfig.buttons}
          onDismiss={hideDialog}
        />
      )}
    </DialogContext.Provider>
  );
}

export function useGlobalDialog() {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useGlobalDialog must be used within a DialogProvider');
  }
  return context;
}

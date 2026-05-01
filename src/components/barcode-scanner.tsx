
'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { X, Camera } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          setHasCameraPermission(true);
          const html5QrCode = new Html5Qrcode("barcode-reader");
          scannerRef.current = html5QrCode;
          
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              onScan(decodedText);
              html5QrCode.stop().then(() => onClose());
            },
            () => {} // silent error for individual frame decode failure
          );
        } else {
          setHasCameraPermission(false);
          toast({
            variant: "destructive",
            title: "No Camera Found",
            description: "No cameras were detected on your device."
          });
        }
      } catch (err) {
        console.error("Scanner error:", err);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description: "Please allow camera access to scan barcodes."
        });
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Error stopping scanner:", err));
      }
    };
  }, [onScan, onClose, toast]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
      <div id="barcode-reader" className="w-full h-full" />
      
      {hasCameraPermission === false && (
        <Alert variant="destructive" className="absolute inset-x-4 top-4">
          <AlertTitle>Camera Access Required</AlertTitle>
          <AlertDescription>
            Please allow camera access in your browser settings to use the scanner.
          </AlertDescription>
        </Alert>
      )}

      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 rounded-full z-50"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 rounded-full text-white text-xs font-medium backdrop-blur-sm flex items-center gap-2">
        <Camera className="h-3 w-3" />
        Align barcode within the scanning frame
      </div>
    </div>
  );
}

import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Save } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  disabled?: boolean;
}

export interface SignaturePadRef {
  clear: () => void;
  isEmpty: () => boolean;
  getSignatureData: () => string;
}

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ onSave, disabled = false }, ref) => {
    const sigCanvas = useRef<SignatureCanvas>(null);

    useImperativeHandle(ref, () => ({
      clear: () => {
        sigCanvas.current?.clear();
      },
      isEmpty: () => {
        return sigCanvas.current?.isEmpty() || false;
      },
      getSignatureData: () => {
        return sigCanvas.current?.toDataURL() || '';
      }
    }));

    const handleClear = () => {
      sigCanvas.current?.clear();
    };

    const handleSave = () => {
      if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
        const signatureData = sigCanvas.current.toDataURL();
        onSave(signatureData);
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Digital Signature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted rounded-lg p-2">
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                width: 500,
                height: 200,
                className: 'signature-canvas w-full h-full',
                style: { 
                  border: '1px solid #ccc', 
                  borderRadius: '4px',
                  pointerEvents: disabled ? 'none' : 'auto',
                  opacity: disabled ? 0.5 : 1
                }
              }}
              backgroundColor="white"
              penColor="black"
              minWidth={1}
              maxWidth={3}
              velocityFilterWeight={0.7}
              throttle={16}
              minDistance={5}
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={disabled}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
            <Button
              onClick={handleSave}
              disabled={disabled}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Signature
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;
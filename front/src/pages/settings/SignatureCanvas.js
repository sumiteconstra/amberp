// SignatureCanvas.js
import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import './SignatureCanvas.css'; 

const SignatureCanvasComponent = forwardRef(({ onSignatureChange }, ref) => {
  const sigCanvas = useRef(null);

  useEffect(() => {
    const updateSignature = () => {
      if (sigCanvas.current) {
        const signature = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
        onSignatureChange(signature);
      }
    };

    // Attach the updateSignature function to the mouseup and touchend events
    if (sigCanvas.current) {
      const canvas = sigCanvas.current.getCanvas();
      canvas.addEventListener('mouseup', updateSignature);
      canvas.addEventListener('touchend', updateSignature);

      // Clean up event listeners on unmount
      return () => {
        canvas.removeEventListener('mouseup', updateSignature);
        canvas.removeEventListener('touchend', updateSignature);
      };
    }
  }, [onSignatureChange]);

  useImperativeHandle(ref, () => ({
    clearSignature: () => {
      if (sigCanvas.current) {
        sigCanvas.current.clear();
        onSignatureChange(''); // Clear the signature
      }
    }
  }));

  const clear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      onSignatureChange(''); // Clear the signature
    }
  };

  return (
    <div className="sigCanvasContainer">
      <SignatureCanvas
        ref={sigCanvas}
        penColor="blue"
        canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
      />
      <button type="button" onClick={clear} className='btn btn-danger btn-sm fit-btn ms-auto'>Clear</button>
    </div>
  );
});

export default SignatureCanvasComponent;

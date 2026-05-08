import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import StepForm from '@/components/attendance/StepForm';
import PhotoCapture from '@/components/attendance/PhotoCapture';
import PhotoEditor from '@/components/attendance/PhotoEditor';
import SignaturePad from '@/components/attendance/SignaturePad';
import NametageResult from '@/components/attendance/NametageResult';

export default function Attendance() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ nama: '', instansi: '' });
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [compositeDataUrl, setCompositeDataUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Step 1: Form
  const handleFormNext = async ({ nama, instansi }) => {
    if (isChecking) return;
    setIsChecking(true);
    try {
      const res = await base44.functions.invoke('submitAttendance', { action: 'checkDuplicate', nama });
      if (res.data?.exists) {
        toast({
          title: 'Sudah Terdaftar',
          description: `Nama "${nama}" sudah terdaftar sebelumnya.`,
          variant: 'destructive',
          duration: 3000,
        });
        return;
      }
      setFormData({ nama, instansi });
      setStep(2);
    } catch (e) {
      setFormData({ nama, instansi });
      setStep(2);
    } finally {
      setIsChecking(false);
    }
  };

  // Step 2: Photo capture
  const handlePhotoNext = (dataUrl) => {
    setPhotoDataUrl(dataUrl);
    setStep(3);
  };

  // Step 3: Photo editor (composite twibbon)
  const handleEditorNext = (compositeUrl) => {
    setCompositeDataUrl(compositeUrl);
    setStep(4);
  };

  // Step 4: Signature → submit
  const handleSignatureNext = async (signatureDataUrl) => {
    setIsSubmitting(true);
    try {
      // Upload foto ke storage
      let fotoUrl = '';
      if (compositeDataUrl) {
        const blob = await (await fetch(compositeDataUrl)).blob();
        const file = new File([blob], 'nametag.png', { type: 'image/png' });
        const uploadRes = await base44.integrations.Core.UploadFile({ file });
        fotoUrl = uploadRes.file_url || '';
      }

      // Kirim ke Google Sheet
      await base44.functions.invoke('submitAttendance', {
        action: 'append',
        nama: formData.nama,
        instansi: formData.instansi,
        fotoUrl,
        tandaTangan: signatureDataUrl,
      });

      setStep(5);
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Menyimpan data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {step === 1 && <StepForm onNext={handleFormNext} isLoading={isChecking} />}
      {step === 2 && <PhotoCapture onNext={handlePhotoNext} onBack={() => setStep(1)} />}
      {step === 3 && (
        <PhotoEditor
          photoDataUrl={photoDataUrl}
          nama={formData.nama}
          instansi={formData.instansi}
          onNext={handleEditorNext}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && <SignaturePad onNext={handleSignatureNext} onBack={() => setStep(3)} />}
      {step === 5 && <NametageResult compositeDataUrl={compositeDataUrl} nama={formData.nama} />}
    </>
  );
}
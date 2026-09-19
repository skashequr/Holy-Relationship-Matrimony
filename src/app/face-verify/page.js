'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { userAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { FaCamera, FaRedo, FaCheckCircle, FaSpinner, FaShieldAlt } from 'react-icons/fa';

export default function FaceVerifyPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const mountedRef = useRef(true);
  const [startingCamera, setStartingCamera] = useState(false);

  const [step, setStep] = useState('intro'); // intro | camera | preview | success
  const [capturedImage, setCapturedImage] = useState(null); // data URL
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Show the actual face review status separately from other verification badges.
  useEffect(() => {
    if (user?.isFaceVerified) setStep('verified');
    else if (user?.faceVerificationStatus === 'pending') setStep('success');
  }, [user, router]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setStartingCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = stream;
      setStep('camera');
    } catch {
      setStep('intro');
      setCameraError('ক্যামেরা অ্যাক্সেস পাওয়া যায়নি। ব্রাউজারে ক্যামেরার অনুমতি দিন।');
    } finally { if (mountedRef.current) setStartingCamera(false); }
  }, []);

  useEffect(() => {
    if (step === 'camera' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => setCameraError('ক্যামেরা চালু হয়নি। আবার চেষ্টা করুন।'));
    }
  }, [step]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; stopCamera(); };
  }, [stopCamera]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || video.readyState < 2) { toast.error('ক্যামেরা প্রস্তুত হলে ছবি তুলুন।'); return; }
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
    setStep('preview');
  }, [stopCamera]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const submit = useCallback(async () => {
    if (!capturedImage) return;
    setLoading(true);
    try {
      // Convert data URL to Blob
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('photo', blob, 'face.jpg');

      await userAPI.submitFaceVerification(formData);
      await refreshUser?.();
      setStep('success');
    } catch (err) {
      toast.error(err.response?.data?.messageBn || 'যাচাই করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  }, [capturedImage, refreshUser]);

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">ফেস যাচাইকরণ</h1>
          <p className="text-sm text-gray-500">সেলফি জমা দিন। অ্যাডমিন ছবি পর্যালোচনা করে যাচাই করবেন।</p>
        </div>

        {/* ── Intro ── */}
        {user?.faceVerificationStatus === 'rejected' && step === 'intro' && <p role="status" className="card text-amber-700">আগের ছবিটি গ্রহণ করা হয়নি। পরিষ্কার সেলফি তুলে আবার জমা দিন।</p>}
        {step === 'intro' && (
          <div className="bg-white rounded-2xl border p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1a5276] to-blue-600 flex items-center justify-center shadow-md">
                <FaShieldAlt className="text-white" size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-800">অ্যাকাউন্ট যাচাইকরণ</p>
                <p className="text-xs text-gray-500">আপনার সেলফি শুধু অ্যাডমিন পর্যালোচনা করতে পারবেন</p>
              </div>
            </div>

            <ul className="space-y-2 text-sm text-gray-600">
              {[
                '📷 সামনের ক্যামেরা (ফ্রন্ট ক্যামেরা) ব্যবহার করুন',
                '💡 পর্যাপ্ত আলোতে ছবি তুলুন',
                '😊 মুখ পুরো ফ্রেমে রাখুন',
                '🚫 সানগ্লাস বা মাস্ক পরবেন না',
                '✅ পর্যালোচনা শেষে ফলাফল এখানে দেখতে পারবেন',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">{tip}</li>
              ))}
            </ul>

            {cameraError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{cameraError}</div>
            )}

            <button
              onClick={startCamera}
              disabled={startingCamera}
              className="w-full bg-[#1a5276] hover:bg-[#154360] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <FaCamera size={15} /> {startingCamera ? 'ক্যামেরা চালু হচ্ছে…' : 'ক্যামেরা চালু করুন'}
            </button>
          </div>
        )}

        {/* ── Camera live ── */}
        {step === 'camera' && (
          <div className="bg-white rounded-2xl border p-4 space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-[4/3]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              {/* Face guide oval */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-44 h-56 border-4 border-white/70 rounded-full shadow-2xl" />
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <p className="text-center text-sm text-gray-500">মুখ ফ্রেমে রেখে ছবি তুলুন</p>
            <button
              onClick={capturePhoto}
              className="w-full bg-[#1a5276] hover:bg-[#154360] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <FaCamera size={15} /> ছবি তুলুন
            </button>
          </div>
        )}

        {/* ── Preview & submit ── */}
        {step === 'preview' && capturedImage && (
          <div className="bg-white rounded-2xl border p-4 space-y-4">
            <div className="rounded-xl overflow-hidden aspect-[4/3] bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={capturedImage} alt="captured face" className="w-full h-full object-cover scale-x-[-1]" />
            </div>
            <p className="text-center text-sm text-gray-600">ছবিটি ঠিক আছে? তাহলে জমা দিন।</p>
            <div className="flex gap-3">
              <button
                onClick={retake}
                disabled={loading || startingCamera}
                className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <FaRedo size={12} /> আবার তুলুন
              </button>
              <button
                onClick={submit}
                disabled={loading}
                className="flex-1 bg-[#1a5276] hover:bg-[#154360] text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {loading ? <FaSpinner size={13} className="animate-spin" /> : <FaCheckCircle size={13} />}
                জমা দিন
              </button>
            </div>
          </div>
        )}

        {/* ── Success ── */}
        {(step === 'success' || step === 'verified') && (
          <div className="bg-white rounded-2xl border p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <FaCheckCircle className="text-green-500" size={40} />
            </div>
            <div>
              <p className="text-xl font-black text-gray-800">{step === 'verified' ? 'যাচাই সম্পন্ন!' : 'সেলফি পর্যালোচনাধীন'}</p>
              <p className="text-sm text-gray-500 mt-1">{step === 'verified' ? 'আপনার অ্যাকাউন্টে যাচাই ব্যাজ যুক্ত হয়েছে।' : 'সেলফি জমা হয়েছে। অ্যাডমিনের অনুমোদনের পর যাচাই ব্যাজ যুক্ত হবে।'}</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-2 bg-[#1a5276] hover:bg-[#154360] text-white font-bold px-8 py-2.5 rounded-xl transition-colors"
            >
              ড্যাশবোর্ডে যান
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

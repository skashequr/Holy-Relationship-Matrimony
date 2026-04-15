'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import PaymentModal from '@/components/PaymentModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { biodataAPI, interestAPI, messageAPI } from '@/lib/api';
import {
  formatAge, formatHeight, formatDate, educationLabels,
  professionLabels, maritalStatusLabels, incomeLabels,
  complexionLabels, madhabLabels, bloodGroups, familyStatusLabels
} from '@/lib/utils';
import {
  FaCheckCircle, FaMapMarkerAlt, FaGraduationCap, FaBriefcase,
  FaHeart, FaRegHeart, FaPhone, FaEnvelope, FaLock, FaUser,
  FaFlag, FaStar, FaShieldAlt, FaExclamationTriangle, FaComment,
  FaSpinner, FaPaperPlane
} from 'react-icons/fa';
import toast from 'react-hot-toast';

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 text-sm w-40 flex-shrink-0">{label}</span>
      <span className="text-gray-800 text-sm font-medium">{value}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="card mb-4">
      <h3 className="font-bold text-[#1a5276] text-base mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
        <span className="w-1 h-5 bg-[#1a5276] rounded-full" />
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}

export default function ProfileDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [biodata, setBiodata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [sendingInterest, setSendingInterest] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [canMessage, setCanMessage] = useState(false);
  const lang = 'bn';

  useEffect(() => {
    fetchBiodata();
  }, [id]);

  useEffect(() => {
    if (biodata && user) {
      setIsShortlisted(user.shortlistedProfiles?.includes(biodata.userId?._id));
      // Premium users can always message; check interest status for others
      if (user.isPremium) {
        setCanMessage(true);
      } else {
        checkInterestStatus();
      }
    }
  }, [biodata, user]);

  const checkInterestStatus = async () => {
    if (!biodata?.userId?._id) return;
    try {
      const { data } = await interestAPI.getSent();
      const match = data.interests?.find(
        (i) => i.receiverId?._id === biodata.userId._id || i.receiverId === biodata.userId._id
      );
      if (match) {
        setInterestSent(true);
        if (match.status === 'accepted') setCanMessage(true);
      }
    } catch {}
  };

  const fetchBiodata = async () => {
    try {
      const { data } = await biodataAPI.getById(id);
      setBiodata(data.biodata);
    } catch (error) {
      toast.error('প্রোফাইল লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInterest = async () => {
    // Use URL param `id` directly — it IS the biodata _id
    if (!id) return;
    setSendingInterest(true);
    try {
      await interestAPI.send({ biodataId: id });
      toast.success('Interest পাঠানো হয়েছে');
      setInterestSent(true);
    } catch (err) {
      const msg = err.response?.data?.messageBn || err.response?.data?.message || 'সমস্যা হয়েছে।';
      toast.error(msg);
    } finally {
      setSendingInterest(false);
    }
  };

  const handleStartChat = async () => {
    if (!biodata?.userId?._id && !biodata?.userId) return;
    setStartingChat(true);
    try {
      const userId = biodata.userId?._id || biodata.userId;
      const { data } = await messageAPI.startConversation(String(userId));
      router.push(`/dashboard/messages?conv=${data.conversation._id}`);
    } catch (err) {
      const msg = err.response?.data?.messageBn || err.response?.data?.message || 'চ্যাট শুরু করা যায়নি।';
      toast.error(msg);
    } finally {
      setStartingChat(false);
    }
  };

  const handleShortlist = async () => {
    try {
      const { data } = await biodataAPI.toggleShortlist(id);
      setIsShortlisted(data.isShortlisted);
      toast.success(data.isShortlisted ? 'শর্টলিস্টে যোগ করা হয়েছে' : 'শর্টলিস্ট থেকে সরানো হয়েছে');
    } catch {
      toast.error('সমস্যা হয়েছে।');
    }
  };

  const hasUnlockedContact = user?.unlockedContacts?.some(
    (uc) => uc.userId === biodata?.userId?._id || uc.userId?.toString() === biodata?.userId?._id?.toString()
  );

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  if (!biodata) return (
    <DashboardLayout>
      <div className="card text-center py-16">
        <p className="text-gray-500">প্রোফাইল পাওয়া যায়নি।</p>
        <Link href="/search" className="btn-primary mt-4 inline-block px-6 py-2.5 rounded-lg">প্রোফাইল খুঁজুন</Link>
      </div>
    </DashboardLayout>
  );

  const { personal, religion, education, profession, family, address, lifestyle, contact, partnerExpectations, userId: profileUser } = biodata;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="card mb-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Photo */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                {biodata.profilePicture || profileUser?.profilePicture ? (
                  <Image
                    src={biodata.profilePicture || profileUser.profilePicture}
                    alt={personal?.fullName}
                    width={160}
                    height={160}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">
                    {profileUser?.gender === 'male' ? '👨' : '👩'}
                  </div>
                )}
              </div>
              <div className="text-center mt-2">
                {biodata.biodataNumber && (
                  <span className="text-xs bg-[#1a5276] text-white px-3 py-1 rounded-full font-medium">
                    {biodata.biodataNumber}
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{personal?.fullName}</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    {formatAge(personal?.age, lang)}
                    {personal?.height && <> · {formatHeight(personal.height, lang)}</>}
                    {personal?.complexion && <> · {complexionLabels[lang]?.[personal.complexion]}</>}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {profileUser?.verificationBadge && (
                      <span className="badge-verified"><FaCheckCircle size={10} /> যাচাইকৃত</span>
                    )}
                    {biodata.status === 'approved' && (
                      <span className="badge-verified"><FaShieldAlt size={10} /> অনুমোদিত</span>
                    )}
                    <span className="text-xs text-gray-400">
                      {biodata.views} বার দেখা হয়েছে
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleShortlist}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      isShortlisted
                        ? 'bg-red-50 border-red-200 text-red-500'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-red-200'
                    }`}
                  >
                    {isShortlisted ? <FaHeart /> : <FaRegHeart />}
                    {isShortlisted ? 'শর্টলিস্টেড' : 'শর্টলিস্ট'}
                  </button>

                  {/* Interest button for non-premium users */}
                  {!user?.isPremium && !interestSent && (
                    <button
                      onClick={handleSendInterest}
                      disabled={sendingInterest}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 transition-all disabled:opacity-50"
                    >
                      {sendingInterest ? <FaSpinner className="animate-spin" size={13} /> : <FaPaperPlane size={13} />}
                      Interest পাঠান
                    </button>
                  )}
                  {!user?.isPremium && interestSent && !canMessage && (
                    <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 bg-yellow-50 border-yellow-200 text-yellow-700">
                      <FaPaperPlane size={13} /> Interest পাঠানো হয়েছে
                    </span>
                  )}

                  {/* Message button: premium OR accepted interest */}
                  {canMessage && (
                    <button
                      onClick={handleStartChat}
                      disabled={startingChat}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 bg-[#1a5276] border-[#1a5276] text-white hover:bg-[#0c3a5e] transition-all disabled:opacity-50"
                    >
                      {startingChat ? <FaSpinner className="animate-spin" size={13} /> : <FaComment size={13} />}
                      বার্তা পাঠান
                    </button>
                  )}
                </div>
              </div>

              {/* Key details grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {[
                  { icon: <FaMapMarkerAlt />, label: address?.permanentDistrict ? `${address.permanentDistrict}, ${address.permanentDivision}` : null },
                  { icon: <FaGraduationCap />, label: educationLabels[lang]?.[education?.highestLevel] },
                  { icon: <FaBriefcase />, label: professionLabels[lang]?.[profession?.occupationType] },
                  { icon: <FaFlag />, label: maritalStatusLabels[lang]?.[personal?.maritalStatus] },
                  { icon: <FaStar />, label: madhabLabels[lang]?.[religion?.madhab] },
                  { icon: <FaUser />, label: personal?.bloodGroup ? `রক্তের গ্রুপ: ${personal.bloodGroup}` : null },
                ].filter((i) => i.label).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-[#1a5276] text-xs">{item.icon}</span>
                    <span className="text-xs text-gray-700 font-medium truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-4">
            {/* About */}
            {lifestyle?.aboutSelf && (
              <Section title="নিজের সম্পর্কে">
                <p className="text-gray-700 text-sm leading-relaxed">{lifestyle.aboutSelf}</p>
              </Section>
            )}

            {/* Personal */}
            <Section title="ব্যক্তিগত তথ্য">
              <InfoRow label="পিতার নাম" value={personal?.fatherName} />
              <InfoRow label="মাতার নাম" value={personal?.motherName} />
              <InfoRow label="জন্ম তারিখ" value={personal?.dateOfBirth ? formatDate(personal.dateOfBirth, lang) : null} />
              <InfoRow label="জন্মস্থান" value={personal?.birthPlace} />
              <InfoRow label="জাতীয়তা" value={personal?.nationality} />
              <InfoRow label="বৈবাহিক অবস্থা" value={maritalStatusLabels[lang]?.[personal?.maritalStatus]} />
              {personal?.maritalStatus !== 'single' && <InfoRow label="সন্তান সংখ্যা" value={personal?.numberOfChildren?.toString()} />}
              <InfoRow label="উচ্চতা" value={personal?.height ? formatHeight(personal.height, lang) : null} />
              <InfoRow label="ওজন" value={personal?.weight ? `${personal.weight} কেজি` : null} />
              <InfoRow label="গায়ের রঙ" value={complexionLabels[lang]?.[personal?.complexion]} />
              <InfoRow label="রক্তের গ্রুপ" value={personal?.bloodGroup} />
              {personal?.physicalDisability && personal.physicalDisability !== 'None' && (
                <InfoRow label="শারীরিক প্রতিবন্ধিতা" value={personal.physicalDisability} />
              )}
            </Section>

            {/* Religion */}
            <Section title="ধর্মীয় তথ্য">
              <InfoRow label="মাযহাব" value={madhabLabels[lang]?.[religion?.madhab]} />
              <InfoRow label="৫ ওয়াক্ত নামায" value={religion?.praysFiveTimes ? 'হ্যাঁ' : 'না'} />
              {profileUser?.gender === 'female' && (
                <InfoRow label="পর্দা পালন" value={religion?.wearsPardah ? 'হ্যাঁ' : 'না'} />
              )}
              {profileUser?.gender === 'male' && (
                <InfoRow label="দাড়ি" value={religion?.hasBeard ? 'হ্যাঁ' : 'না'} />
              )}
              <InfoRow label="হারাম বর্জন" value={religion?.avoidsHaram ? 'হ্যাঁ' : 'না'} />
              <InfoRow label="কুরআন তিলাওয়াত" value={{
                complete: 'সম্পূর্ণ পারেন',
                partial: 'আংশিক পারেন',
                learning: 'শিখছেন',
                none: 'পারেন না',
              }[religion?.quranRecitation]} />
            </Section>

            {/* Education */}
            <Section title="শিক্ষাগত যোগ্যতা">
              <InfoRow label="সর্বোচ্চ শিক্ষা" value={educationLabels[lang]?.[education?.highestLevel]} />
              <InfoRow label="ডিগ্রির নাম" value={education?.degreeName} />
              <InfoRow label="প্রতিষ্ঠান" value={education?.institution} />
              <InfoRow label="বিষয়" value={education?.subject} />
              <InfoRow label="পাসের বছর" value={education?.passingYear?.toString()} />
            </Section>

            {/* Profession */}
            <Section title="পেশাগত তথ্য">
              <InfoRow label="পেশা" value={professionLabels[lang]?.[profession?.occupationType]} />
              <InfoRow label="পদবি" value={profession?.designation} />
              <InfoRow label="প্রতিষ্ঠান" value={profession?.organization} />
              <InfoRow label="মাসিক আয়" value={incomeLabels[lang]?.[profession?.monthlyIncome]} />
            </Section>

            {/* Family */}
            <Section title="পারিবারিক তথ্য">
              <InfoRow label="পিতা" value={family?.fatherAlive !== undefined ? (family.fatherAlive ? `জীবিত${family.fatherOccupation ? ` · ${family.fatherOccupation}` : ''}` : 'মৃত') : null} />
              <InfoRow label="মাতা" value={family?.motherAlive !== undefined ? (family.motherAlive ? `জীবিত${family.motherOccupation ? ` · ${family.motherOccupation}` : ''}` : 'মৃত') : null} />
              <InfoRow label="ভাই" value={family?.numberOfBrothers !== undefined ? `${family.numberOfBrothers} জন` : null} />
              <InfoRow label="বোন" value={family?.numberOfSisters !== undefined ? `${family.numberOfSisters} জন` : null} />
              <InfoRow label="পরিবারের ধরন" value={{ nuclear: 'একক পরিবার', joint: 'যৌথ পরিবার' }[family?.familyType]} />
              <InfoRow label="পারিবারিক অবস্থা" value={familyStatusLabels[lang]?.[family?.familyStatus]} />
              <InfoRow label="পরিবারের ধর্মপরায়ণতা" value={{ moderate: 'মধ্যম', religious: 'ধার্মিক', very_religious: 'অত্যন্ত ধার্মিক' }[family?.familyReligiousness]} />
            </Section>

            {/* Address */}
            <Section title="ঠিকানা">
              <InfoRow label="স্থায়ী ঠিকানা" value={[address?.permanentUpazila, address?.permanentDistrict, address?.permanentDivision].filter(Boolean).join(', ')} />
              <InfoRow label="বর্তমান ঠিকানা" value={[address?.currentUpazila, address?.currentDistrict, address?.currentDivision].filter(Boolean).join(', ')} />
              <InfoRow label="বড় হয়েছেন" value={{ village: 'গ্রামে', town: 'শহরে', city: 'মহানগরে' }[address?.grewUpIn]} />
            </Section>

            {/* Hobbies */}
            {lifestyle?.hobbies?.length > 0 && (
              <Section title="শখ ও বিশেষ গুণ">
                <div className="flex flex-wrap gap-2 mb-3">
                  {lifestyle.hobbies.map((h, i) => (
                    <span key={i} className="bg-[#1a5276]/10 text-[#1a5276] text-xs px-3 py-1.5 rounded-full font-medium">{h}</span>
                  ))}
                </div>
                {lifestyle.specialQualities && <p className="text-sm text-gray-700">{lifestyle.specialQualities}</p>}
              </Section>
            )}

            {/* Partner expectations */}
            {partnerExpectations && (
              <Section title="প্রত্যাশিত জীবনসঙ্গী">
                {(partnerExpectations.ageMin || partnerExpectations.ageMax) && (
                  <InfoRow label="বয়স" value={`${partnerExpectations.ageMin || '-'} থেকে ${partnerExpectations.ageMax || '-'} বছর`} />
                )}
                {partnerExpectations.education?.length > 0 && (
                  <InfoRow label="শিক্ষা" value={partnerExpectations.education.map((e) => educationLabels[lang]?.[e]).join(', ')} />
                )}
                {partnerExpectations.profession?.length > 0 && (
                  <InfoRow label="পেশা" value={partnerExpectations.profession.map((p) => professionLabels[lang]?.[p]).join(', ')} />
                )}
                {partnerExpectations.district?.length > 0 && (
                  <InfoRow label="জেলা" value={partnerExpectations.district.join(', ')} />
                )}
                {partnerExpectations.otherExpectations && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">অন্যান্য প্রত্যাশা</p>
                    <p className="text-sm text-gray-700">{partnerExpectations.otherExpectations}</p>
                  </div>
                )}
              </Section>
            )}
          </div>

          {/* Sidebar: Contact info */}
          <div className="space-y-4">
            {/* Contact unlock card */}
            <div className="card border-2 border-dashed border-[#1a5276]/30 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
                <FaPhone className="text-[#1a5276]" /> যোগাযোগের তথ্য
              </h3>

              {hasUnlockedContact ? (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-xs text-green-600 font-semibold flex items-center gap-1 mb-2">
                      <FaCheckCircle /> আনলক করা হয়েছে
                    </p>
                    {contact?.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <FaPhone className="text-gray-400" size={12} />
                        <a href={`tel:${contact.phone}`} className="text-[#1a5276] font-semibold hover:underline">{contact.phone}</a>
                      </div>
                    )}
                    {contact?.alternatePhone && (
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <FaPhone className="text-gray-400" size={12} />
                        <a href={`tel:${contact.alternatePhone}`} className="text-[#1a5276] font-semibold hover:underline">{contact.alternatePhone}</a>
                      </div>
                    )}
                    {contact?.email && (
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <FaEnvelope className="text-gray-400" size={12} />
                        <span className="text-gray-700">{contact.email}</span>
                      </div>
                    )}
                    {contact?.guardianName && (
                      <div className="mt-2 pt-2 border-t border-green-100">
                        <p className="text-xs text-gray-500">অভিভাবক: <span className="font-medium text-gray-700">{contact.guardianName} ({contact.guardianRelation})</span></p>
                        {contact.guardianPhone && (
                          <a href={`tel:${contact.guardianPhone}`} className="text-xs text-[#1a5276] font-medium">{contact.guardianPhone}</a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center mb-4">
                    <FaLock className="mx-auto text-gray-300 mb-2" size={28} />
                    <p className="text-xs text-gray-500">যোগাযোগের তথ্য লক করা আছে।</p>
                    <p className="text-xs text-gray-400 mt-1">মাত্র ৫০ টাকায় আনলক করুন।</p>
                  </div>
                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full btn-gold py-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    <FaLock size={13} /> ৫০ টাকায় আনলক করুন
                  </button>
                </div>
              )}
            </div>

            {/* Report */}
            <button
              onClick={() => setShowReport(true)}
              className="w-full text-xs text-red-400 hover:text-red-600 flex items-center justify-center gap-1 py-2 transition-colors"
            >
              <FaExclamationTriangle size={10} /> এই প্রোফাইল রিপোর্ট করুন
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          targetUserId={biodata.userId?._id}
          targetName={personal?.fullName}
          biodataId={biodata._id}
          onClose={() => setShowPayment(false)}
          onSuccess={() => { fetchBiodata(); refreshUser(); }}
        />
      )}
    </DashboardLayout>
  );
}

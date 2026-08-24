'use client';

import Image from 'next/image';
import { FaTimes } from 'react-icons/fa';
import {
  educationLabels,
  professionLabels,
  maritalStatusLabels,
  incomeLabels,
  complexionLabels,
  madhabLabels,
  familyStatusLabels,
  formatDate,
  formatHeight,
} from '@/lib/utils';

const boolField = (val) => (val === undefined || val === null ? null : val ? 'হ্যাঁ' : 'না');
const lbl = (map, key) => (map?.bn?.[key] || null);

function Section({ title, children }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 px-3 py-2 rounded-lg mb-2">{title}</h4>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-1">{children}</div>
    </div>
  );
}

function Field({ label, value, full }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className={full ? 'col-span-2' : ''}>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xs font-medium text-gray-700 mt-0.5">{String(value)}</p>
    </div>
  );
}

const statusColors = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-600',
  draft: 'bg-gray-100 text-gray-600',
};
const statusLabels = {
  approved: 'অনুমোদিত',
  pending: 'পর্যালোচনাধীন',
  rejected: 'প্রত্যাখ্যাত',
  draft: 'ড্রাফট',
};

export default function BiodataDetailModal({ biodata, onClose }) {
  if (!biodata) return null;
  const b = biodata;
  const photo = b.profilePicture || b.userId?.profilePicture;
  const isMale = b.userId?.gender === 'male';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
              {photo ? (
                <Image src={photo} alt="" width={48} height={48} className="object-cover" />
              ) : (
                <span className="text-2xl">{isMale ? '👨' : '👩'}</span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{b.personal?.fullName || b.userId?.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500">{b.biodataNumber}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[b.status]}`}>
                  {statusLabels[b.status]}
                </span>
                <span className="text-xs text-gray-400">{isMale ? 'পুরুষ' : 'মহিলা'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 transition-colors"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto p-5 space-y-4">
          {/* Personal */}
          <Section title="ব্যক্তিগত তথ্য">
            <Field label="পুরো নাম" value={b.personal?.fullName} />
            <Field label="বয়স" value={b.personal?.age != null ? `${b.personal.age} বছর` : null} />
            <Field label="জন্মতারিখ" value={b.personal?.dateOfBirth ? formatDate(b.personal.dateOfBirth) : null} />
            <Field label="উচ্চতা" value={b.personal?.height ? formatHeight(b.personal.height) : null} />
            <Field label="ওজন" value={b.personal?.weight ? `${b.personal.weight} কেজি` : null} />
            <Field label="গায়ের রং" value={lbl(complexionLabels, b.personal?.complexion)} />
            <Field label="রক্তের গ্রুপ" value={b.personal?.bloodGroup} />
            <Field label="বৈবাহিক অবস্থা" value={lbl(maritalStatusLabels, b.personal?.maritalStatus)} />
            <Field label="সন্তান সংখ্যা" value={b.personal?.numberOfChildren != null ? String(b.personal.numberOfChildren) : null} />
            <Field label="বাবার নাম" value={b.personal?.fatherName} />
            <Field label="মায়ের নাম" value={b.personal?.motherName} />
            <Field label="জন্মস্থান" value={b.personal?.birthPlace} />
            <Field label="জাতীয়তা" value={b.personal?.nationality} />
            <Field label="শারীরিক প্রতিবন্ধকতা" value={b.personal?.physicalDisability !== 'None' ? b.personal?.physicalDisability : null} />
          </Section>

          {/* Religion */}
          <Section title="ধর্মীয় তথ্য">
            <Field label="মাযহাব" value={lbl(madhabLabels, b.religion?.madhab)} />
            <Field label="পাঁচ ওয়াক্ত নামাজ" value={boolField(b.religion?.praysFiveTimes)} />
            <Field label="পর্দা পালন করেন" value={boolField(b.religion?.wearsPardah)} />
            <Field label="দাড়ি আছে" value={boolField(b.religion?.hasBeard)} />
            <Field label="সুন্নাহ পোশাক" value={boolField(b.religion?.followsSunnahDress)} />
            <Field label="হারাম বর্জন" value={boolField(b.religion?.avoidsHaram)} />
            <Field
              label="কোরআন তেলাওয়াত"
              value={{ complete: 'সম্পূর্ণ', partial: 'আংশিক', learning: 'শিখছেন', none: 'পারেন না' }[b.religion?.quranRecitation] || null}
            />
          </Section>

          {/* Education */}
          <Section title="শিক্ষাগত যোগ্যতা">
            <Field label="সর্বোচ্চ শিক্ষা" value={lbl(educationLabels, b.education?.highestLevel)} />
            <Field label="ডিগ্রির নাম" value={b.education?.degreeName} />
            <Field label="বিষয়" value={b.education?.subject} />
            <Field label="পাশের বছর" value={b.education?.passingYear ? String(b.education.passingYear) : null} />
            <Field label="প্রতিষ্ঠান" full value={b.education?.institution} />
          </Section>

          {/* Profession */}
          <Section title="পেশাগত তথ্য">
            <Field label="পেশা" value={lbl(professionLabels, b.profession?.occupationType)} />
            <Field label="মাসিক আয়" value={lbl(incomeLabels, b.profession?.monthlyIncome)} />
            <Field label="পদবি" value={b.profession?.designation} />
            <Field label="প্রতিষ্ঠান" value={b.profession?.organization} />
          </Section>

          {/* Family */}
          <Section title="পারিবারিক তথ্য">
            <Field label="বাবা জীবিত" value={boolField(b.family?.fatherAlive)} />
            <Field label="বাবার পেশা" value={b.family?.fatherOccupation} />
            <Field label="মা জীবিত" value={boolField(b.family?.motherAlive)} />
            <Field label="মায়ের পেশা" value={b.family?.motherOccupation} />
            <Field label="ভাই সংখ্যা" value={b.family?.numberOfBrothers != null ? String(b.family.numberOfBrothers) : null} />
            <Field label="বোন সংখ্যা" value={b.family?.numberOfSisters != null ? String(b.family.numberOfSisters) : null} />
            <Field label="পরিবারের ধরন" value={{ nuclear: 'একক পরিবার', joint: 'যৌথ পরিবার' }[b.family?.familyType] || null} />
            <Field label="পারিবারিক অবস্থা" value={lbl(familyStatusLabels, b.family?.familyStatus)} />
            <Field
              label="পারিবারিক ধার্মিকতা"
              value={{ moderate: 'মধ্যপন্থী', religious: 'ধার্মিক', very_religious: 'অত্যন্ত ধার্মিক' }[b.family?.familyReligiousness] || null}
            />
          </Section>

          {/* Address */}
          <Section title="ঠিকানা">
            <Field label="স্থায়ী বিভাগ" value={b.address?.permanentDivision} />
            <Field label="স্থায়ী জেলা" value={b.address?.permanentDistrict} />
            <Field label="স্থায়ী উপজেলা" value={b.address?.permanentUpazila} />
            <Field label="বর্তমান বিভাগ" value={b.address?.currentDivision} />
            <Field label="বর্তমান জেলা" value={b.address?.currentDistrict} />
            <Field label="বর্তমান উপজেলা" value={b.address?.currentUpazila} />
            <Field label="বেড়ে উঠেছেন" value={{ village: 'গ্রামে', town: 'শহরে', city: 'নগরে' }[b.address?.grewUpIn] || null} />
          </Section>

          {/* Contact */}
          <Section title="যোগাযোগের তথ্য">
            <Field label="ফোন" value={b.contact?.phone} />
            <Field label="বিকল্প ফোন" value={b.contact?.alternatePhone} />
            <Field label="ইমেইল" value={b.contact?.email} />
            <Field label="অভিভাবকের নাম" value={b.contact?.guardianName} />
            <Field label="অভিভাবকের ফোন" value={b.contact?.guardianPhone} />
            <Field label="অভিভাবকের সম্পর্ক" value={b.contact?.guardianRelation} />
          </Section>

          {/* Lifestyle */}
          {(b.lifestyle?.aboutSelf || b.lifestyle?.specialQualities || b.lifestyle?.hobbies?.length > 0) && (
            <Section title="জীবনধারা ও ব্যক্তিত্ব">
              <Field label="শখ" value={b.lifestyle?.hobbies?.length > 0 ? b.lifestyle.hobbies.join(', ') : null} />
              <Field label="বিশেষ গুণাবলী" full value={b.lifestyle?.specialQualities} />
              <Field label="নিজের সম্পর্কে" full value={b.lifestyle?.aboutSelf} />
            </Section>
          )}

          {/* Partner Expectations */}
          {b.partnerExpectations && (
            <Section title="পাত্র/পাত্রী প্রত্যাশা">
              <Field
                label="বয়স সীমা"
                value={
                  b.partnerExpectations.ageMin != null && b.partnerExpectations.ageMax != null
                    ? `${b.partnerExpectations.ageMin}–${b.partnerExpectations.ageMax} বছর`
                    : null
                }
              />
              <Field
                label="গায়ের রং"
                value={b.partnerExpectations.complexion?.map((c) => complexionLabels.bn[c]).filter(Boolean).join(', ') || null}
              />
              <Field
                label="শিক্ষা"
                value={b.partnerExpectations.education?.map((e) => educationLabels.bn[e]).filter(Boolean).join(', ') || null}
              />
              <Field
                label="পেশা"
                value={b.partnerExpectations.profession?.map((p) => professionLabels.bn[p]).filter(Boolean).join(', ') || null}
              />
              <Field label="জেলা" value={b.partnerExpectations.district?.join(', ') || null} />
              <Field label="অর্থনৈতিক অবস্থা" value={b.partnerExpectations.financialStatus} />
              <Field label="অন্যান্য প্রত্যাশা" full value={b.partnerExpectations.otherExpectations} />
            </Section>
          )}

          {/* Rejection reason */}
          {b.status === 'rejected' && b.rejectionReason && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3">
              <p className="text-xs font-semibold text-red-600 mb-1">প্রত্যাখ্যানের কারণ</p>
              <p className="text-xs text-red-500">{b.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

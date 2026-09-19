"use client";
import { useParams } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import { biodataAPI, referralAPI, interestAPI } from '@/lib/api';
import Profile from '../../profile/[id]/page';
const bio={_id:'preview-bio',biodataNumber:'BD000124',status:'approved',views:28,userId:{_id:'preview-user',gender:'male',verificationBadge:true},personal:{fullName:'পরীক্ষামূলক সদস্য',age:28,height:173,weight:68,maritalStatus:'single',nationality:'বাংলাদেশি',bloodGroup:'B+'},religion:{madhab:'hanafi',praysFiveTimes:true,hasBeard:true,avoidsHaram:true},education:{highestLevel:'honours',institution:'পরীক্ষামূলক বিশ্ববিদ্যালয়',subject:'কম্পিউটার বিজ্ঞান'},profession:{occupationType:'engineer',designation:'সফটওয়্যার ইঞ্জিনিয়ার'},family:{numberOfBrothers:1,numberOfSisters:1,familyType:'nuclear'},address:{permanentDistrict:'ঢাকা',permanentDivision:'ঢাকা'},lifestyle:{aboutSelf:'পরিবার ও ইসলামিক মূল্যবোধকে গুরুত্ব দিয়ে একটি সুন্দর ভবিষ্যৎ গড়তে চাই। বই পড়া, ভ্রমণ এবং নতুন কিছু শেখা আমার পছন্দ।',hobbies:['বই পড়া','ভ্রমণ']},partnerExpectations:{ageMin:22,ageMax:28,otherExpectations:'পারস্পরিক সম্মান ও বোঝাপড়াকে গুরুত্ব দেন এমন একজন জীবনসঙ্গী।'},contact:{}};
biodataAPI.getById=async()=>({data:{biodata:bio}});
referralAPI.getMe=async()=>({data:{points:25}});
referralAPI.checkUnlock=async()=>({data:{isUnlocked:false}});
interestAPI.getSent=async()=>({data:{interests:[]}});
export default function Preview(){const {id}=useParams(); if(id==='mobile') return <iframe title="Mobile profile preview" src="/qa-profile-preview/sample" style={{width:390,height:844,border:0,display:'block',margin:'0 auto'}} />;return <AuthContext.Provider value={{user:{_id:'preview-viewer',name:'Preview Member',gender:'female',shortlistedProfiles:[]},loading:false,isAuthenticated:true,refreshUser:async()=>{},logout:()=>{}}}><Profile/></AuthContext.Provider>}

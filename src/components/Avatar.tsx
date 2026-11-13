import { useState } from 'react';

export default function Avatar({ value, className = '' }: { value?: string | null; className?: string }) {
  const [failedUrl, setFailedUrl] = useState('');
  const isPhoto = Boolean(value && /^https:\/\//i.test(value));
  if (isPhoto && value !== failedUrl) return <img src={value!} alt="" referrerPolicy="no-referrer" onError={() => setFailedUrl(value!)} className={`rounded-full object-cover ${className}`} />;

  return <svg aria-hidden="true" viewBox="0 0 48 48" className={`rounded-full ${className}`}>
    {value === 'avatar-3' ? <><rect width="48" height="48" fill="#b8e5fa" /><circle cx="35" cy="12" r="5" fill="#f9cc65" /><path d="M0 39 15 21 25 33 31 26 48 44v4H0Z" fill="#427b72" /><path d="m0 44 13-12 10 9 8-7 17 10v4H0Z" fill="#275d5a" /></> : <><rect width="48" height="48" fill={value === 'avatar-2' ? '#ead7ef' : '#c7ddf4'} /><path d="M8 48c1-11 7-16 16-16s15 5 16 16" fill={value === 'avatar-2' ? '#ac6290' : '#4177b2'} />{value === 'avatar-2' && <path d="M11 23c0-12 4-17 13-17s13 5 13 17v12H11Z" fill="#513b35" />}<circle cx="24" cy="21" r="10" fill="#eab991" /><path d={value === 'avatar-2' ? 'M14 18C14 9 19 7 24 7c7 0 11 4 11 12-4-1-9-5-11-8-2 4-6 6-10 7Z' : 'M14 18c0-8 4-11 10-11s10 3 10 11c-4-1-6-3-8-5-3 3-7 4-12 5Z'} fill="#513b35" /><circle cx="20" cy="22" r="1" fill="#352d2a" /><circle cx="28" cy="22" r="1" fill="#352d2a" /><path d="M21 27q3 2 6 0" fill="none" stroke="#9a5a53" strokeLinecap="round" /></>}
  </svg>;
}

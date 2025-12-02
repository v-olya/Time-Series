'use client';

import { useRouter } from 'next/navigation';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  return (<div className="txt-c">
    <div className='heading'><h2 className="badge-primary">Something went wrong!</h2></div>
    <p>{error.message}</p>
    <p>
      <button className="badge badge-primary badge-button" onClick={reset}>Restore</button>
    </p>
  </div>
  );
}
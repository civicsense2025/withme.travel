import Image from 'next/image';

<Image
  src={trip.coverImageUrl || '/default-placeholder.jpg'}
  alt={trip.name || 'Trip cover image'}
/>;

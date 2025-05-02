// Simple script to verify environment variables
console.log('Environment variables check:');
console.log('DISABLE_CSP =', process.env.DISABLE_CSP);
console.log('NODE_ENV =', process.env.NODE_ENV);

// Check if we're reading from .env files
console.log('\nAll environment variables:');
console.log(process.env);

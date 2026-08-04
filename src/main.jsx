import { ViteReactSSG } from 'vite-react-ssg';
import routes from '@/routes';
import '@/i18n/config';
import '@/index.css';

export const createRoot = ViteReactSSG({ routes });

import {defineConfig} from 'vite';
export default defineConfig(({command})=>({base:process.env.GITHUB_PAGES==='true'?'/da-meeting/':'/'}));

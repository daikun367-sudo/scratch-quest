import type {Metadata} from 'next';
import './globals.css';
export const metadata: Metadata={title:'SCRATCH QUEST — ぼうけんの書',description:'Scratchを使って12の世界を冒険しよう。BASICとADVANCEのストーリー型プログラミング教材。'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ja"><body>{children}</body></html>}

import { ScrollText } from "lucide-react";

export function MotivationalSection() {
  return (
    <section className="py-24 border-b-[3px] border-[#000000] border-[3px] border-[#000000] -white/10 relative overflow-hidden">
      
      {/* Decorative Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#FFD600]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
        
        <div className="relative bg-[#FFFFFF]/5 backdrop-blur-xl border-[3px] border-[#000000] -white/10 rounded-[32px] p-8 md:p-16 shadow-2xl hover:shadow-[0_0_50px_rgba(255,214,0,0.15)] transition-shadow duration-500 overflow-hidden group">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FFD600]/20 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-20 h-20 bg-[#FFFFFF]/10 rounded-full flex items-center justify-center mb-8 border-[3px] border-[#000000] -white/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
              <ScrollText className="w-10 h-10 text-[#FFD600]" />
            </div>
            
            <h2 className="text-3xl font-black md:text-5xl font-black text-white mb-8 drop-shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] tracking-tight leading-tight">
              عهد من <span className="text-[#00B4D8]">صناع النجاح</span>
            </h2>
            
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#FFD600] to-transparent mb-10 opacity-50"></div>
            
            <p className="text-xl font-black md:text-2xl font-black text-slate-300 font-bold leading-relaxed max-w-3xl space-y-6">
              <span className="block mb-4">
                إلى كل تلميذ يحمل حلما كبيرا بين يديه... نحن هنا لنكون الجسر الذي يعبر بك نحو القمة.
              </span>
              <span className="block mb-4">
                منصة دقيش التعليمية ليست مجرد موقع إلكتروني، بل هي عهد التزمنا به لنوفر لك أفضل ما يملكه العقل والجهد والابتكار. طريق البكالوريا قد يبدو طويلا وشاقا، لكنك لست وحدك.
              </span>
              <span className="block text-white text-2xl font-black md:text-3xl font-black mt-8 pt-6 border-t-[3px] border-[#000000] border-[3px] border-[#000000] -white/10">
                لا تتنازل عن حلمك، فمكانك الحقيقي هو القمة.
              </span>
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

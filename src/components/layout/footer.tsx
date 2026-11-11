import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full bg-[#07182c] text-slate-300 border-t border-slate-800 mt-auto">
      <div className="container mx-auto px-4 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#c59b27]" />
              أكاديمية السادات للعلوم الإدارية
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              صرح أكاديمي رائد في مصر والشرق الأوسط، يعمل وفق رؤية وطنية تهدف إلى تنمية وتطوير العلوم الإدارية والتحول الرقمي لخدمة المجتمع الأكاديمي.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold text-white mb-3">روابط سريعة</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-[#c59b27] transition-colors">
                  الصفحة الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/#submit-ticket" className="hover:text-[#c59b27] transition-colors">
                  تقديم شكوى أو مقترح
                </Link>
              </li>
              <li>
                <Link href="/tickets/track" className="hover:text-[#c59b27] transition-colors">
                  متابعة حالة الشكوى
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-white mb-3">الفروع المعتمدة</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              القاهرة (المعادي - رمسيس) • الإسكندرية • بورسعيد • المنصورة • طنطا • أسيوط • المنيا.
            </p>
            <div className="mt-4 text-xs text-slate-400">
              الدعم الفني والخدمات الإلكترونية المركزية
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <div>
            جميع الحقوق محفوظة © {new Date().getFullYear()} أكاديمية السادات للعلوم الإدارية.
          </div>
          <div className="mt-2 sm:mt-0">
            بوابة الشكاوى المركزية والتوجيه الذكي
          </div>
        </div>
      </div>
    </footer>
  );
}

import React from 'react';
import { X, Gamepad2, Shield, Crosshair, BookOpen, Trophy } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-2xl bg-slate-950 border-2 border-cyan-500 rounded-lg shadow-2xl shadow-cyan-500/20 overflow-hidden font-mono">
        {/* Header */}
        <div className="bg-slate-900 border-b border-cyan-500/40 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-arcade text-cyan-400">CẨM NANG CHIẾN ĐẤU CONTRA 2D</h3>
              <p className="text-[10px] text-slate-400">Cơ chế bắn 8 hướng, nâng cấp vũ khí & vượt chướng ngại vật</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-slate-300">
          {/* Controls */}
          <div className="bg-slate-900/90 border border-slate-700 rounded-md p-3.5 space-y-2">
            <h4 className="font-arcade text-yellow-400 text-xs flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-yellow-400" />
              <span>PHÍM ĐIỀU KHIỂN & BẮN 8 HƯỚNG</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-cyan-300 font-bold">A / D hoặc Mũi tên Trái / Phải:</span> Di chuyển trái / phải
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-cyan-300 font-bold">W hoặc Mũi tên Lên:</span> Ngắm bắn thẳng lên trời
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-cyan-300 font-bold">S hoặc Mũi tên Xuống:</span> Nằm rạp né đạn (Crouch / Prone)
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-cyan-300 font-bold">W + A hoặc W + D:</span> Bắn chéo góc 45 độ (Up-Left / Up-Right)
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-emerald-400 font-bold">SPACE (Phím cách) / K:</span> Nhảy nhào lộn (Somersault Jump)
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-red-400 font-bold">J / Z / Chuột Trái:</span> Bắn súng liên hồi (Shoot)
              </div>
            </div>
          </div>

          {/* Weapons */}
          <div className="bg-slate-900/90 border border-slate-700 rounded-md p-3.5 space-y-2">
            <h4 className="font-arcade text-red-400 text-xs flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-red-400" />
              <span>KHO VŨ KHÍ & HỆ THỐNG NÂNG CẤP</span>
            </h4>
            <p className="text-[11px] text-slate-300">
              Bắn hạ các máy bay con nhộng (Flying Pods) bay trên trời để nhặt huy hiệu vũ khí hình chim ưng Falcon. Thu thập nhiều lần cùng 1 loại sẽ nâng cấp lên Level 2 và Level 3 cực mạnh!
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1">
              <div className="bg-slate-950 p-2 rounded border border-red-500/40">
                <span className="text-red-400 font-bold">[S] Spread Gun:</span> Đạn toả 5-7 hướng huyền thoại
              </div>
              <div className="bg-slate-950 p-2 rounded border border-orange-500/40">
                <span className="text-orange-400 font-bold">[M] Machine Gun:</span> Súng máy liên thanh tốc độ cao
              </div>
              <div className="bg-slate-950 p-2 rounded border border-cyan-500/40">
                <span className="text-cyan-400 font-bold">[L] Laser Beam:</span> Tia laser xuyên phá nhiều mục tiêu
              </div>
              <div className="bg-slate-950 p-2 rounded border border-rose-500/40">
                <span className="text-rose-400 font-bold">[F] Flame Fire:</span> Cầu lửa xoáy gây sát thương nổ
              </div>
              <div className="bg-slate-950 p-2 rounded border border-purple-500/40">
                <span className="text-purple-400 font-bold">[H] Homing:</span> Tên lửa tự tìm kiếm mục tiêu
              </div>
              <div className="bg-slate-950 p-2 rounded border border-blue-500/40">
                <span className="text-blue-400 font-bold">[B] Barrier:</span> Khiên hộ thể bất tử tạm thời
              </div>
            </div>
          </div>

          {/* Knowledge Obstacles & Leaderboard */}
          <div className="bg-slate-900/90 border border-slate-700 rounded-md p-3.5 space-y-2">
            <h4 className="font-arcade text-emerald-400 text-xs flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>CHƯỚNG NGẠI VẬT CÂU HỎI & BẢNG XẾP HẠNG</span>
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-[11px] text-slate-300">
              <li>
                <strong className="text-cyan-300">Cổng Điện Từ Năng Lượng:</strong> Chắn ngang đường đi ở các cứ điểm. Khi tiếp cận sẽ bật cửa sổ câu hỏi trắc nghiệm.
              </li>
              <li>
                <strong className="text-emerald-300">Quy tắc vượt ải:</strong> Trả lời đúng sẽ làm rào chắn nổ tung, nhận ngay +1500 điểm thưởng và quà vũ khí hiếm. Nếu trả lời sai, bạn sẽ trả lời lại đến khi đúng để tiếp tục hành trình!
              </li>
              <li>
                <strong className="text-yellow-300">Chọn môn học:</strong> Bạn có thể đổi môn (Toán, Khoa học, Sử, Địa, Tiếng Anh, Tin học) bất kỳ lúc nào qua nút môn trên thanh điều khiển.
              </li>
              <li>
                <strong className="text-amber-400">Bảng Xếp Hạng:</strong> Thành tích cao được ưu tiên xếp hạng hàng đầu dựa trên <strong className="text-white underline">Số câu trả lời đúng</strong> cùng với tổng điểm số.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900 border-t border-slate-800 px-4 py-2.5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-arcade text-xs font-bold rounded transition-all cursor-pointer active:scale-95"
          >
            ĐÃ HIỂU! CHIẾN ĐẤU NGAY
          </button>
        </div>
      </div>
    </div>
  );
};

export default function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 px-5 md:w-[28%]">
      <Icon size={40} className="text-[#fc697b]" />
      <h3 className="text-xl font-semibold ">{title}</h3>
      <p className="text-gray-600">{text}</p>
    </div>
  );
}

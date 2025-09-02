export default function BackgroundDecorations() {
  return (
    <>
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5"></div>
      <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
      <div
        className="absolute bottom-20 right-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      ></div>
    </>
  );
}

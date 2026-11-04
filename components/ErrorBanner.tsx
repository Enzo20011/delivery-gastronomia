export default function ErrorBanner({ mensaje }: { mensaje: string }) {
  return (
    <p className="mb-4 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-300">
      {mensaje}
    </p>
  );
}

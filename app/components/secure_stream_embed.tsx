type SecureStreamEmbedProps = {
  src: string;
  title: string;
  className?: string;
};

function isHttpUrl(value: string): boolean {
  try {
    const protocol = new URL(value, 'https://streamio.invalid').protocol;
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

export default function SecureStreamEmbed({ src, title, className }: SecureStreamEmbedProps) {
  if (!isHttpUrl(src)) {
    return (
      <div className={className} role="status">
        This stream has an invalid address.
      </div>
    );
  }

  return (
    <iframe
      src={src}
      title={title}
      className={className}
      sandbox="allow-scripts allow-presentation"
      allowFullScreen
      allow="autoplay; fullscreen; picture-in-picture"
      referrerPolicy="no-referrer"
    />
  );
}

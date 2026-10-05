import { useState } from "react";
import { Image, type ImageProps } from "expo-image";
import { resolveImageUrl } from "@/lib/assets/resolveImageUrl";

interface Props extends Omit<ImageProps, "source" | "onError"> {
  source: string | null | undefined;
  fallback: string;
}

/** Falls back to a default image when `source` is missing OR fails to load —
 * covers both "no thumbnail" and "thumbnail URL is broken/unreachable". */
export function ArtworkImage({ source, fallback, ...rest }: Props) {
  const [failed, setFailed] = useState(false);
  const uri = failed ? fallback : resolveImageUrl(source, fallback);
  return <Image source={uri} onError={() => setFailed(true)} {...rest} />;
}

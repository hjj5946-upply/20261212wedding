import { WEDDING } from "../config/wedding";
import { HeroSection } from "../sections/HeroSection";
import { StorySection } from "../sections/StorySection";
import { GallerySection } from "../sections/GallerySection";
import { InfoSection } from "../sections/InfoSection";
import { LocationSection } from "../sections/LocationSection";
import { RsvpSection } from "../sections/RsvpSection";
import { FooterSection } from "../sections/FooterSection";

export function Invitation() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <HeroSection data={WEDDING} />
      <StorySection data={WEDDING} />
      <GallerySection data={WEDDING} />
      <InfoSection data={WEDDING} />
      <LocationSection data={WEDDING} />
      <RsvpSection data={WEDDING} />
      <FooterSection data={WEDDING} />
    </main>
  );
}

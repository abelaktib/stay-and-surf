import Experience from "@/components/Experience";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import Rooms from "@/components/Rooms";
import Night from "@/components/Night";
import BookingSection from "@/components/BookingSection";
import StickyBook from "@/components/StickyBook";
import { HouseHead, Stay, Place, Faq, Footer } from "@/components/Sections";
import { SITE } from "@/lib/config";

export default async function Home({ params }) {
  const { locale } = await params;
  return (
    <Experience house={SITE.house}>
      <Header locale={locale} />
      <main id="contenu" tabIndex={-1}>
        <Hero locale={locale} />
        <Intro locale={locale} />
        <HouseHead locale={locale} />
        <Rooms locale={locale} />
        <Stay locale={locale} />
        <Place locale={locale} />
        <Night locale={locale} />
        <BookingSection locale={locale} />
        <Faq locale={locale} />
      </main>
      <Footer locale={locale} />
      <StickyBook locale={locale} />
    </Experience>
  );
}

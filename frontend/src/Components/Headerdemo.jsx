"use client";
import React, { useEffect, useRef } from "react";
import UnicornStudioEmbed from "../Background/UnicornStudioEmbed";
import { assets } from "../assets/assets_frontend/assets";
import Lenis from "lenis";
import {
  Animator,
  ScrollContainer,
  ScrollPage,
  batch,
  Fade,
  FadeIn,
  Move,
  MoveIn,
  MoveOut,
  Sticky,
  StickyIn,
  ZoomIn,
} from "react-scroll-motion";

const Header = () => {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const ZoomInScrollOut = batch(StickyIn(), FadeIn(), ZoomIn());
  const FadeUp = batch(Fade(), Move(), Sticky());

  return (
    <div ref={wrapperRef} className="w-full">
      {/* 🔁 Background */}
      <div className="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none">
        <UnicornStudioEmbed
          projectId="UoU6tCsTzJZXfkwww1zf"
          scale={1}
          dpi={1.5}
          fps={30}
          altText="MRI scan scene background"
          lazyLoad={false}
        />
      </div>

      {/* 🔳 Content Scroll */}
      <main className="relative z-10">
        <ScrollContainer>
          <ScrollPage>
            <Animator animation={batch(Fade(), Sticky(), MoveOut(0, -200))}>
              <span className="text-right text-2xl font-bold">
                Prioritize your health -
              </span>
              <br />
              <br />
              <span className="text-center text-3xl font-bold text-white">
                Advanced Medical Imaging for Preventative Health
                <br />
                <span
                  style={{ color: "#D0E057" }}
                  className="text-center text-3xl font-bold"
                >
                  Book your Screening MRI today!
                  <button
                    style={{ backgroundColor: "#D0E057" }}
                    className=" ml-5 w-30 text-sm sm:text-base text-black px-8 py-3 rounded-full mt-6 hover:scale-105 transition-all"
                  >
                    Schedule a Scan
                  </button>
                </span>
              </span>
            </Animator>
          </ScrollPage>

          <ScrollPage>
            <Animator animation={ZoomInScrollOut}>
              <span className="text-2xl sm:text-3xl md:text-4xl text-white text-center px-4">
                Explore Our Offerings
              </span>
            </Animator>
          </ScrollPage>

          <ScrollPage>
            <Animator animation={FadeUp}>
              <span className="text-2xl sm:text-3xl md:text-4xl text-white text-center px-4">
                I'm FadeUp ⛅️
              </span>
            </Animator>
          </ScrollPage>

          <ScrollPage>
            <div className="flex flex-col items-center justify-center h-full text-white text-lg sm:text-xl md:text-2xl lg:text-3xl px-4 text-center">
              <Animator animation={MoveIn(-1000, 0)}>
                <div className="mb-2">Hello Guys 👋🏻</div>
              </Animator>
              <Animator animation={MoveIn(1000, 0)}>
                <div className="mb-2">Nice to meet you 🙋🏻‍♀️</div>
              </Animator>
              <div className="my-4">- I'm Dante Chun -</div>
              <Animator animation={MoveOut(1000, 0)}>
                <div className="mb-2">Good bye ✋🏻</div>
              </Animator>
              <Animator animation={MoveOut(-1000, 0)}>
                <div>See you 💛</div>
              </Animator>
            </div>
          </ScrollPage>

          <ScrollPage>
            <Animator animation={batch(Fade())}>
              <div className="flex flex-col items-center justify-center text-center px-4">
                <span className="text-2xl sm:text-3xl md:text-4xl text-white mb-4">
                  Done
                </span>
                <span className="text-sm sm:text-base md:text-xl lg:text-2xl text-white max-w-4xl">
                  There's FadeAnimation, MoveAnimation, StickyAnimation, ZoomAnimation
                </span>
              </div>
            </Animator>
          </ScrollPage>
        </ScrollContainer>
      </main>
    </div>
  );
};

export default Header;

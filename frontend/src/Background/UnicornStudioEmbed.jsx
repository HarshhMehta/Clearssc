import { useEffect, useRef, useState } from "react";
import { addPropertyControls, ControlType, RenderTarget } from "framer";

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 * @framerIntrinsicHeight 400
 * @framerIntrinsicWidth 800
 */
export default function UnicornStudioEmbed(props) {
  const elementRef = useRef(null);
  const sceneRef = useRef(null);
  const scriptId = useRef(`unicorn-project-${Math.random().toString(36).substr(2, 9)}`);
  const [jsonError, setJsonError] = useState(null);

  useEffect(() => {
    const isEditingOrPreviewing = ["CANVAS", "PREVIEW"].includes(RenderTarget.current());

    if (RenderTarget.current() === "CANVAS") return;

    const initializeScript = (callback) => {
      if (!document.querySelector('script[src^="https://cdn.unicorn.studio"]')) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.8/dist/unicornStudio.umd.js";
        script.onload = callback;
        document.head.appendChild(script);
      } else {
        callback();
      }
    };

    const initializeUnicornStudio = () => {
      if (!elementRef.current) return;

      if (props.projectJSON) {
        try {
          JSON.parse(props.projectJSON);

          const dataScript = document.createElement("script");
          dataScript.id = scriptId.current;
          dataScript.type = "application/json";
          dataScript.textContent = props.projectJSON;
          document.head.appendChild(dataScript);

          elementRef.current.setAttribute("data-us-project-src", scriptId.current);
          setJsonError(null);
        } catch (e) {
          console.error("Invalid JSON:", e);
          setJsonError(e.message);
          return;
        }
      } else if (props.projectId) {
        const [id, query] = props.projectId.split("?");
        const isProd = query?.includes("production");
        const cacheBuster = isEditingOrPreviewing ? `?update=${Date.now()}` : "";

        elementRef.current.setAttribute("data-us-project", id + cacheBuster);
        if (isProd) elementRef.current.setAttribute("data-us-production", "1");
      }

      if (window.UnicornStudio) {
        try {
          const existingScene = window.UnicornStudio.scenes?.find(
            (scene) =>
              scene.element === elementRef.current ||
              scene.element?.contains(elementRef.current)
          );

          if (existingScene) {
            existingScene.destroy();
          } else {
            window.UnicornStudio.destroy?.();
          }

          window.UnicornStudio.init()
            .then((scenes) => {
              const ourScene = scenes.find(
                (scene) =>
                  scene.element === elementRef.current ||
                  scene.element?.contains(elementRef.current)
              );
              sceneRef.current = ourScene ?? null;
            })
            .catch((err) => console.error("Unicorn Studio init error:", err));
        } catch (error) {
          console.error("Error initializing scene:", error);
        }
      }
    };

    if (props.projectId || props.projectJSON) {
      if (window.UnicornStudio) {
        initializeUnicornStudio();
      } else {
        initializeScript(initializeUnicornStudio);
      }
    }

    return () => {
      sceneRef.current?.destroy?.();
      sceneRef.current = null;

      const script = document.getElementById(scriptId.current);
      if (script) script.remove();
    };
  }, [props.projectId, props.projectJSON]);

  if (RenderTarget.current() === "CANVAS") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0)",
          color: "#4B5563",
          fontWeight: 500,
          textAlign: "center",
          padding: "16px",
        }}
      >
        <p style={{ fontSize: "1.25rem", marginBottom: "12px" }}>
          Scene will render in Preview and on your published site.
        </p>
        {!props.projectId && !props.projectJSON ? (
          <p style={{ fontSize: "1rem", color: "#EF4444" }}>
            No project ID or JSON provided.
          </p>
        ) : jsonError ? (
          <p style={{ fontSize: "1rem", color: "#EF4444" }}>
            JSON Error: {jsonError}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div
      ref={elementRef}
      data-us-dpi={props.dpi}
      data-us-scale={props.scale}
      data-us-fps={props.fps}
      data-us-alttext={props.altText}
      data-us-arialabel={props.ariaLabel}
      data-us-lazyload={props.lazyLoad ? "true" : ""}
      style={{ width: "100%", height: "100%", ...props.style }}
    >
      {props.header && (
        <h1
          style={{
            width: "1px",
            height: "1px",
            margin: "-1px",
            padding: "0",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            border: "0",
          }}
        >
          {props.header}
        </h1>
      )}
      {jsonError && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#FEF2F2",
            color: "#B91C1C",
            border: "1px solid #F87171",
            borderRadius: "4px",
            margin: "8px",
          }}
        >
          JSON Error: {jsonError}
        </div>
      )}
    </div>
  );
}

UnicornStudioEmbed.displayName = "Unicorn Studio Embed";

addPropertyControls(UnicornStudioEmbed, {
  projectId: {
    type: ControlType.String,
    title: "Project ID",
  },
  projectJSON: {
    type: ControlType.String,
    title: "Project JSON",
    displayTextArea: true,
  },
  scale: {
    type: ControlType.Number,
    title: "Scale",
    defaultValue: 1,
    min: 0.25,
    max: 1,
    step: 0.01,
  },
  dpi: {
    type: ControlType.Number,
    title: "DPI",
    defaultValue: 1.5,
    min: 0.5,
    max: 2,
    step: 0.1,
  },
  fps: {
    type: ControlType.Number,
    title: "FPS",
    defaultValue: 60,
    min: 10,
    max: 120,
    step: 5,
  },
  header: {
    type: ControlType.String,
    title: "H1 text",
  },
  altText: {
    type: ControlType.String,
    title: "Alt text",
  },
  ariaLabel: {
    type: ControlType.String,
    title: "Aria label",
  },
  lazyLoad: {
    type: ControlType.Boolean,
    title: "Lazy Load",
    defaultValue: false,
  },
});

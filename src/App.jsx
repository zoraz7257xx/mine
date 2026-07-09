import React, { useEffect, useMemo, useRef, useState } from "react";
import { experiences, metrics, projects, site, strengths, workCategories } from "./content.js";

const STORAGE_KEY = "zeng-xuan-portfolio-content-v10";

const defaultContent = {
  site,
  metrics,
  experiences,
  projects,
  workCategories,
  strengths,
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeContent(base, saved) {
  if (Array.isArray(base)) {
    if (!Array.isArray(saved)) {
      return clone(base);
    }
    return base.map((item, index) => (index in saved ? mergeContent(item, saved[index]) : clone(item)));
  }

  if (!base || typeof base !== "object") {
    return saved ?? base;
  }

  const next = clone(base);
  if (!saved || typeof saved !== "object") {
    return next;
  }

  Object.keys(saved).forEach((key) => {
    if (key in base) {
      next[key] = mergeContent(base[key], saved[key]);
    }
  });

  return next;
}

function setPath(source, path, value) {
  const next = clone(source);
  let target = next;

  path.slice(0, -1).forEach((key) => {
    target = target[key];
  });

  target[path.at(-1)] = value;
  return next;
}

function EditableText({
  as: Tag = "span",
  editMode,
  value,
  onChange,
  className,
  singleLine = false,
  ...props
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.textContent = value;
    }
  }, [value, editMode]);

  if (!editMode) {
    return (
      <Tag className={className} {...props}>
        {value}
      </Tag>
    );
  }

  return (
    <Tag
      className={className}
      contentEditable
      data-editable="true"
      ref={ref}
      suppressContentEditableWarning
      onBlur={(event) => onChange(event.currentTarget.textContent)}
      onKeyDown={(event) => {
        if (singleLine && event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
      {...props}
    >
      {value}
    </Tag>
  );
}

function App() {
  const [content, setContent] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? mergeContent(defaultContent, JSON.parse(saved)) : clone(defaultContent);
    } catch {
      return clone(defaultContent);
    }
  });
  const [editMode, setEditMode] = useState(false);
  const [saveState, setSaveState] = useState("未保存");
  const [activeArchivePath, setActiveArchivePath] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(null);

  const {
    site: page,
    metrics: pageMetrics,
    experiences: pageExperiences,
    workCategories: pageWorkCategories,
    strengths: pageStrengths,
  } = content;
  const { contact } = page;

  const edit = (path, value) => {
    setContent((current) => setPath(current, path, value));
    setSaveState("有修改");
  };

  const saveEdits = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    setSaveState("已保存");
  };

  const resetEdits = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setContent(clone(defaultContent));
    setSaveState("已恢复默认");
  };

  const preventEditClick = (event) => {
    if (editMode) {
      event.preventDefault();
    }
  };

  const editorHint = useMemo(
    () => (editMode ? "编辑模式已开启：点击页面文字直接修改，改完点保存。" : "预览模式"),
    [editMode],
  );
  const activeArchive =
    activeArchivePath === null
      ? null
      : pageWorkCategories[activeArchivePath.categoryIndex]?.children?.[activeArchivePath.childIndex] || null;
  const activeMediaItems = activeArchive
    ? [
        ...(activeArchive.videos || []).map((video, index) => ({
          ...video,
          type: "video",
          title:
            video.title ||
            activeArchive.mediaLabels?.videos?.[index] ||
            `视频材料 ${String(index + 1).padStart(2, "0")}`,
          index,
        })),
        ...(activeArchive.images || []).map((image, index) => ({
          type: "image",
          src: image,
          title:
            activeArchive.mediaLabels?.images?.[index] ||
            `图片材料 ${String(index + 1).padStart(2, "0")}`,
          index,
        })),
      ]
    : [];
  const activeMedia = activeMediaIndex === null ? null : activeMediaItems[activeMediaIndex];

  const openArchive = (categoryIndex, childIndex) => {
    const nextPath = { categoryIndex, childIndex };
    setActiveArchivePath(nextPath);
    setActiveMediaIndex(null);
    window.history.pushState({ portfolioArchivePath: nextPath }, "", window.location.href);
  };

  const closeArchiveWithHistory = () => {
    if (activeArchive) {
      window.history.back();
    }
  };

  useEffect(() => {
    const handlePopState = (event) => {
      setActiveArchivePath(event.state?.portfolioArchivePath || null);
      setActiveMediaIndex(null);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    document.body.style.overflow = activeArchive ? "hidden" : "";
    if (!activeArchive) {
      setActiveMediaIndex(null);
    }

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }
      if (activeMediaIndex !== null) {
        setActiveMediaIndex(null);
        return;
      }
      closeArchiveWithHistory();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeArchive, activeMediaIndex]);

  return (
    <>
      <main className={editMode ? "isEditing" : ""}>
        <section className="hero" id="home">
          <nav className="nav">
            <a className="brand" href="#home" aria-label="返回首页" onClick={preventEditClick}>
              <EditableText
                editMode={editMode}
                value={page.initials}
                onChange={(value) => edit(["site", "initials"], value)}
                singleLine
              />
              <EditableText
                as="strong"
                editMode={editMode}
                value={page.name}
                onChange={(value) => edit(["site", "name"], value)}
                singleLine
              />
            </a>
            <div className="navLinks">
              {page.nav.map((item, index) => (
                <a href={item.href} key={item.href} onClick={preventEditClick}>
                  <EditableText
                    editMode={editMode}
                    value={item.label}
                    onChange={(value) => edit(["site", "nav", index, "label"], value)}
                    singleLine
                  />
                </a>
              ))}
            </div>
            <a className="navCta" href={`mailto:${contact.email}`} onClick={preventEditClick}>
              <EditableText
                editMode={editMode}
                value={page.hero.contactAction}
                onChange={(value) => edit(["site", "hero", "contactAction"], value)}
                singleLine
              />
            </a>
          </nav>

          <div className="heroContent container">
            <EditableText
              as="p"
              className="eyebrow"
              editMode={editMode}
              value={page.hero.eyebrow}
              onChange={(value) => edit(["site", "hero", "eyebrow"], value)}
              singleLine
            />
            <h1>
              <EditableText
                editMode={editMode}
                value={page.hero.titleLine1}
                onChange={(value) => edit(["site", "hero", "titleLine1"], value)}
                singleLine
              />
              <EditableText
                editMode={editMode}
                value={page.hero.titleLine2}
                onChange={(value) => edit(["site", "hero", "titleLine2"], value)}
                singleLine
              />
            </h1>
            <aside className="heroAside">
              <EditableText
                as="p"
                className="heroLead"
                editMode={editMode}
                value={page.hero.lead}
                onChange={(value) => edit(["site", "hero", "lead"], value)}
              />
              <div className="heroTagList" aria-label="核心方向">
                <span>市场与营销</span>
                <span>内容运营</span>
                <span>拍摄视觉</span>
                <span>AI 工作流</span>
              </div>
              <div className="heroActions">
                <a className="primaryButton" href="#projects" onClick={preventEditClick}>
                  <EditableText
                    editMode={editMode}
                    value={page.hero.primaryAction}
                    onChange={(value) => edit(["site", "hero", "primaryAction"], value)}
                    singleLine
                  />
                </a>
                <a className="ghostButton" href={`tel:${contact.phone}`} onClick={preventEditClick}>
                  <EditableText
                    editMode={editMode}
                    value={contact.phone}
                    onChange={(value) => edit(["site", "contact", "phone"], value)}
                    singleLine
                  />
                </a>
              </div>
            </aside>
            <div className="heroMediaShell">
              <video
                className="heroVideo"
                src="/assets/hero-video.mp4"
                autoPlay
                muted
                loop
                playsInline
                poster="/assets/storyboard.png"
              />
              <div className="heroMediaOverlay" />
            </div>

          </div>
        </section>

        <section className="section profileSection" id="profile">
          <div className="container profileGrid">
            <div className="portraitPanel">
              <div className="portraitGlow" />
              <EditableText
                className="portraitMark"
                editMode={editMode}
                value={page.initials}
                onChange={(value) => edit(["site", "initials"], value)}
                singleLine
              />
              <div className="portraitIdentity">
                <EditableText
                  as="p"
                  editMode={editMode}
                  value={page.name}
                  onChange={(value) => edit(["site", "name"], value)}
                  singleLine
                />
                <EditableText
                  editMode={editMode}
                  value={contact.role}
                  onChange={(value) => edit(["site", "contact", "role"], value)}
                  singleLine
                />
              </div>
              <div className="portraitMeta">
                <a href={`mailto:${contact.email}`} onClick={preventEditClick}>
                  <EditableText
                    editMode={editMode}
                    value={contact.email}
                    onChange={(value) => edit(["site", "contact", "email"], value)}
                    singleLine
                  />
                </a>
                <a href={`tel:${contact.phone}`} onClick={preventEditClick}>
                  <EditableText
                    editMode={editMode}
                    value={contact.phone}
                    onChange={(value) => edit(["site", "contact", "phone"], value)}
                    singleLine
                  />
                </a>
                <EditableText
                  as="span"
                  editMode={editMode}
                  value={contact.city}
                  onChange={(value) => edit(["site", "contact", "city"], value)}
                  singleLine
                />
              </div>
              <div className="portraitTags" aria-label="核心能力">
                <span>市场调研</span>
                <span>营销运营</span>
                <span>视觉拍摄</span>
                <span>AI 视频</span>
              </div>
            </div>

            <div className="profileContent">
              <EditableText
                as="p"
                className="sectionKicker"
                editMode={editMode}
                value={page.profile.kicker}
                onChange={(value) => edit(["site", "profile", "kicker"], value)}
                singleLine
              />
              <EditableText
                as="h2"
                editMode={editMode}
                value={page.profile.title}
                onChange={(value) => edit(["site", "profile", "title"], value)}
              />
              <EditableText
                as="p"
                className="sectionIntro"
                editMode={editMode}
                value={page.profile.intro}
                onChange={(value) => edit(["site", "profile", "intro"], value)}
              />

              <div className="metricGrid">
                {pageMetrics.map((item, index) => (
                  <div className="metricCard" key={index}>
                    <EditableText
                      as="strong"
                      editMode={editMode}
                      value={item.value}
                      onChange={(value) => edit(["metrics", index, "value"], value)}
                      singleLine
                    />
                    <EditableText
                      editMode={editMode}
                      value={item.label}
                      onChange={(value) => edit(["metrics", index, "label"], value)}
                      singleLine
                    />
                  </div>
                ))}
              </div>

              <div className="experienceList">
                {pageExperiences.map((item, index) => (
                  <article className="experienceItem" key={index}>
                    <div>
                      <EditableText
                        as="strong"
                        editMode={editMode}
                        value={item.company}
                        onChange={(value) => edit(["experiences", index, "company"], value)}
                        singleLine
                      />
                      <EditableText
                        editMode={editMode}
                        value={item.time}
                        onChange={(value) => edit(["experiences", index, "time"], value)}
                        singleLine
                      />
                    </div>
                    <EditableText
                      as="p"
                      editMode={editMode}
                      value={item.role}
                      onChange={(value) => edit(["experiences", index, "role"], value)}
                      singleLine
                    />
                    <EditableText
                      as="small"
                      editMode={editMode}
                      value={item.detail}
                      onChange={(value) => edit(["experiences", index, "detail"], value)}
                    />
                    {item.highlights?.length ? (
                      <ul>
                        {item.highlights.map((highlight, highlightIndex) => (
                          <li key={highlightIndex}>
                            <EditableText
                              editMode={editMode}
                              value={highlight}
                              onChange={(value) =>
                                edit(["experiences", index, "highlights", highlightIndex], value)
                              }
                            />
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section archiveSection mergedWorkSection" id="projects">
          <span className="sectionAnchor" id="work-archive" aria-hidden="true" />
          <div className="container sectionHeader">
            <EditableText
              as="p"
              className="sectionKicker"
              editMode={editMode}
              value={page.archiveIntro.kicker}
              onChange={(value) => edit(["site", "archiveIntro", "kicker"], value)}
              singleLine
            />
            <EditableText
              as="h2"
              editMode={editMode}
              value={page.archiveIntro.title}
              onChange={(value) => edit(["site", "archiveIntro", "title"], value)}
              singleLine
            />
            <EditableText
              as="p"
              editMode={editMode}
              value={page.archiveIntro.intro}
              onChange={(value) => edit(["site", "archiveIntro", "intro"], value)}
            />
          </div>

          <div className="container workCarouselGroups">
            {pageWorkCategories.map((category, categoryIndex) => (
              <section className={`workCarouselGroup workGroup${categoryIndex + 1}`} key={categoryIndex} aria-label={category.title}>
                <div className="workCarouselHeader">
                  <div>
                    <EditableText
                      as="span"
                      className="archiveLabel"
                      editMode={editMode}
                      value={category.label}
                      onChange={(value) => edit(["workCategories", categoryIndex, "label"], value)}
                      singleLine
                    />
                    <EditableText
                      as="h3"
                      editMode={editMode}
                      value={category.title}
                      onChange={(value) => edit(["workCategories", categoryIndex, "title"], value)}
                    />
                  </div>
                  <EditableText
                    as="p"
                    editMode={editMode}
                    value={category.summary}
                    onChange={(value) => edit(["workCategories", categoryIndex, "summary"], value)}
                  />
                  <strong>{category.children.length} 个子项目</strong>
                </div>

                <div className="workCarousel" aria-label={`${category.title} 项目卡片`}>
                  {category.children.map((child, childIndex) => {
                    const previewImages = child.previewImages || child.images || [];
                    const cover = previewImages[0] || child.videos?.[0]?.poster;
                    return (
                      <article className="workCard" key={childIndex}>
                        <button
                          type="button"
                          className={`workCardMedia ${child.previewLayout === "nineGrid" ? "workCardMediaGrid" : ""}`}
                          onClick={() => openArchive(categoryIndex, childIndex)}
                          aria-label={`查看 ${child.title}`}
                        >
                          {child.previewLayout === "nineGrid" ? (
                            previewImages.slice(0, 9).map((image, imageIndex) => (
                              <span key={image}>
                                <img src={image} alt={`${child.title} ${imageIndex + 1}`} loading="lazy" />
                              </span>
                            ))
                          ) : (
                            <>
                              {child.videos?.length ? <span className="videoPill">VIDEO</span> : null}
                              <img src={cover} alt={child.title} loading="lazy" />
                            </>
                          )}
                        </button>
                        <div className="workCardBody">
                          <EditableText
                            as="span"
                            className="subProjectLabel"
                            editMode={editMode}
                            value={child.label}
                            onChange={(value) =>
                              edit(["workCategories", categoryIndex, "children", childIndex, "label"], value)
                            }
                            singleLine
                          />
                          <EditableText
                            as="h4"
                            editMode={editMode}
                            value={child.title}
                            onChange={(value) =>
                              edit(["workCategories", categoryIndex, "children", childIndex, "title"], value)
                            }
                          />
                          <EditableText
                            as="p"
                            editMode={editMode}
                            value={child.summary}
                            onChange={(value) =>
                              edit(["workCategories", categoryIndex, "children", childIndex, "summary"], value)
                            }
                          />
                        </div>
                        <button
                          type="button"
                          className="workCardOpen"
                          onClick={() => openArchive(categoryIndex, childIndex)}
                        >
                          查看材料
                        </button>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className="section strengthsSection" id="strengths">
          <div className="container sectionHeader compact">
            <EditableText
              as="p"
              className="sectionKicker"
              editMode={editMode}
              value={page.strengthsIntro.kicker}
              onChange={(value) => edit(["site", "strengthsIntro", "kicker"], value)}
              singleLine
            />
            <EditableText
              as="h2"
              editMode={editMode}
              value={page.strengthsIntro.title}
              onChange={(value) => edit(["site", "strengthsIntro", "title"], value)}
              singleLine
            />
          </div>
          <div className="container strengthGrid">
            {pageStrengths.map((item, index) => (
              <article className="strengthCard" key={index}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <EditableText
                  as="h3"
                  editMode={editMode}
                  value={item.title}
                  onChange={(value) => edit(["strengths", index, "title"], value)}
                  singleLine
                />
                <EditableText
                  as="p"
                  editMode={editMode}
                  value={item.body}
                  onChange={(value) => edit(["strengths", index, "body"], value)}
                />
              </article>
            ))}
          </div>
        </section>

        <section className="contactSection" id="contact">
          <div className="container contactInner">
            <EditableText
              as="p"
              className="sectionKicker"
              editMode={editMode}
              value={page.contactSection.kicker}
              onChange={(value) => edit(["site", "contactSection", "kicker"], value)}
              singleLine
            />
            <EditableText
              as="h2"
              editMode={editMode}
              value={page.contactSection.title}
              onChange={(value) => edit(["site", "contactSection", "title"], value)}
            />
            <div className="contactLines">
              <a href={`mailto:${contact.email}`} onClick={preventEditClick}>
                <EditableText
                  editMode={editMode}
                  value={contact.email}
                  onChange={(value) => edit(["site", "contact", "email"], value)}
                  singleLine
                />
              </a>
              <a href={`tel:${contact.phone}`} onClick={preventEditClick}>
                <EditableText
                  editMode={editMode}
                  value={contact.phone}
                  onChange={(value) => edit(["site", "contact", "phone"], value)}
                  singleLine
                />
              </a>
              <span>
                <EditableText
                  editMode={editMode}
                  value={page.contactSection.intent}
                  onChange={(value) => edit(["site", "contactSection", "intent"], value)}
                  singleLine
                />
                {" · "}
                <EditableText
                  editMode={editMode}
                  value={contact.city}
                  onChange={(value) => edit(["site", "contact", "city"], value)}
                  singleLine
                />
              </span>
            </div>
            <div className="contactActions">
              <a className="primaryButton" href={`mailto:${contact.email}`} onClick={preventEditClick}>
                <EditableText
                  editMode={editMode}
                  value={page.contactSection.emailAction}
                  onChange={(value) => edit(["site", "contactSection", "emailAction"], value)}
                  singleLine
                />
              </a>
              <a className="ghostButton" href={`tel:${contact.phone}`} onClick={preventEditClick}>
                <EditableText
                  editMode={editMode}
                  value={page.contactSection.phoneAction}
                  onChange={(value) => edit(["site", "contactSection", "phoneAction"], value)}
                  singleLine
                />
              </a>
            </div>
          </div>
        </section>
      </main>

      <aside className="editorDock" aria-label="网页编辑工具">
        <div>
          <strong>{editMode ? "编辑模式" : "预览模式"}</strong>
          <span>{editorHint}</span>
          <small>{saveState}</small>
        </div>
        <button type="button" onClick={() => setEditMode((current) => !current)}>
          {editMode ? "退出编辑" : "开始编辑"}
        </button>
        <button type="button" onClick={saveEdits}>
          保存
        </button>
        <button type="button" className="subtleButton" onClick={resetEdits}>
          恢复默认
        </button>
      </aside>

      {activeArchive ? (
        <section
          className="archiveModal"
          aria-modal="true"
          role="dialog"
          aria-label={activeArchive.title}
        >
          <div className="archiveModalPanel" onClick={(event) => event.stopPropagation()}>
            <div className="archiveModalHeader">
              <div>
                <span>{activeArchive.label}</span>
                <h2>{activeArchive.title}</h2>
                <p>{activeArchive.summary}</p>
              </div>
              <p className="archiveBackHint">使用浏览器返回键回到作品列表</p>
            </div>

            <div className="archiveModalBody">
              <aside className="archiveBrief">
                <strong>我在这个项目中的作用</strong>
                <p>{activeArchive.role}</p>
                <strong>HR / 业务可以重点看</strong>
                <ul>
                  {(activeArchive.details || [activeArchive.summary]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </aside>

              <div className="archiveMediaBrowser">
                <div className="archiveMediaIntro">
                  <strong>项目材料</strong>
                  <span>先浏览全部缩略图，点击任意材料后放大查看。</span>
                </div>
                <div className="archiveMediaGrid">
                  {activeMediaItems.map((item, index) => (
                    <button
                      type="button"
                      className="archiveMediaThumb"
                      key={`${item.type}-${item.src}-${index}`}
                      onClick={() => setActiveMediaIndex(index)}
                      aria-label={`查看 ${item.title || activeArchive.title}`}
                    >
                      {item.type === "video" ? <span className="videoPill">VIDEO</span> : null}
                      <img src={item.poster || item.src} alt={item.title || `${activeArchive.title} 材料 ${index + 1}`} />
                      <span className="archiveMediaThumbMeta">
                        <strong>{item.title || `${activeArchive.title} 材料`}</strong>
                        <small>{String(index + 1).padStart(2, "0")}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {activeMedia ? (
              <div className="archiveLightbox" onClick={() => setActiveMediaIndex(null)}>
                <figure onClick={(event) => event.stopPropagation()}>
                  {activeMedia.type === "video" ? (
                    <video src={activeMedia.src} poster={activeMedia.poster} controls autoPlay preload="metadata" />
                  ) : (
                    <img src={activeMedia.src} alt={activeMedia.title || activeArchive.title} />
                  )}
                  <figcaption>{activeMedia.title || activeArchive.title}</figcaption>
                </figure>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}

export default App;

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { Node, Mark, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  List, ListOrdered, AlignLeft, AlignCenter, 
  AlignRight, Heading1, Heading2, Heading3, 
  Link as LinkIcon, Image as ImageIcon, 
  Undo, Redo, Quote, Code, X, FileCode, Clock, RefreshCw
} from 'lucide-react';
import { useCallback, useState, useEffect, useRef } from 'react';
import { getCloudinarySignature } from '@/lib/actions/media';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Custom Extensions to preserve raw HTML ---
const IframeExtension = Node.create({
  name: 'iframe',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      width: { default: '100%' },
      height: { default: '400' },
      frameborder: { default: '0' },
      allowfullscreen: { default: 'true' },
      allow: { default: null },
      style: { default: null },
      class: { default: null }
    };
  },
  parseHTML() { return [{ tag: 'iframe' }]; },
  renderHTML({ HTMLAttributes }) { return ['iframe', mergeAttributes(HTMLAttributes)]; },
});

const VideoExtension = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      controls: { default: 'true' },
      width: { default: '100%' },
      style: { default: null },
      class: { default: null }
    };
  },
  parseHTML() { return [{ tag: 'video' }]; },
  renderHTML({ HTMLAttributes }) { return ['video', mergeAttributes(HTMLAttributes)]; },
});

const CustomSpan = Mark.create({
  name: 'customSpan',
  addAttributes() {
    return {
      style: { default: null },
      class: { default: null },
    };
  },
  parseHTML() { return [{ tag: 'span' }]; },
  renderHTML({ HTMLAttributes }) { return ['span', mergeAttributes(HTMLAttributes), 0]; },
});

const CustomDiv = Node.create({
  name: 'customDiv',
  group: 'block',
  content: 'inline*',
  addAttributes() {
    return {
      style: { default: null },
      class: { default: null },
      dir: { default: null },
    };
  },
  parseHTML() { return [{ tag: 'div' }]; },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes), 0]; },
});
// ----------------------------------------------

const EDITOR_STYLES = `
  .tiptap {
    outline: none !important;
  }
  .tiptap p {
    margin-bottom: 1.5rem;
  }
  .tiptap h1 {
    font-size: 2rem;
    font-weight: 900;
    margin-top: 2.5rem;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
  }
  .tiptap h2 {
    font-size: 1.5rem;
    font-weight: 900;
    margin-top: 2rem;
    margin-bottom: 1.25rem;
    color: var(--text-primary);
  }
  .tiptap h3 {
    font-size: 1.25rem;
    font-weight: 900;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }
  .tiptap ul {
    list-style-type: disc;
    margin-right: 1.5rem;
    margin-bottom: 1.5rem;
  }
  .tiptap ol {
    list-style-type: decimal;
    margin-right: 1.5rem;
    margin-bottom: 1.5rem;
  }
  .tiptap blockquote {
    border-right: 4px solid var(--primary);
    background: color-mix(in srgb, var(--primary) 5%, transparent);
    padding: 1.5rem 2rem;
    margin: 2rem 0;
    font-style: italic;
    font-weight: 900;
  }
  .tiptap img {
    max-width: 100%;
    height: auto;
    border-radius: 1rem;
    margin: 2rem auto;
    display: block;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  }
  .tiptap a {
    color: var(--primary);
    text-decoration: underline;
    font-weight: 700;
  }
  .tiptap iframe, .tiptap video {
    max-width: 100%;
    border-radius: 1rem;
    margin: 2rem auto;
    display: block;
  }
`;

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  draftKey?: string;
}

const MenuButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  children,
  title,
  variant = 'default'
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
  variant?: 'default' | 'primary';
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg transition-all ${
      isActive 
        ? 'bg-primary text-white shadow-md' 
        : variant === 'primary'
          ? 'bg-primary/10 text-primary hover:bg-primary/20'
          : 'hover:bg-elevated text-text-secondary hover:text-text-primary'
    } disabled:opacity-30`}
  >
    {children}
  </button>
);

export function RichTextEditor({ content, onChange, placeholder, draftKey }: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  
  const [isCodeView, setIsCodeView] = useState(false);
  const isCodeViewRef = useRef(isCodeView);
  useEffect(() => { isCodeViewRef.current = isCodeView; }, [isCodeView]);

  const [htmlContent, setHtmlContent] = useState(content);
  
  // Draft System State
  const [hasDraft, setHasDraft] = useState(false);
  const [draftContent, setDraftContent] = useState('');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          className: 'text-primary underline decoration-primary/30 underline-offset-4 font-bold',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          className: 'rounded-2xl shadow-lg border border-border-subtle my-8 mx-auto block max-w-full',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      IframeExtension,
      VideoExtension,
      CustomDiv,
      CustomSpan,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      // Smart Sync: Only fire if we are actually editing in Visual Mode
      // This prevents Tiptap from overwriting raw HTML changes when toggling
      if (!isCodeViewRef.current) {
        const html = editor.getHTML();
        setHtmlContent(html);
        onChange(html);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[400px] max-w-none p-6 text-text-primary leading-loose',
        dir: 'rtl',
      },
    },
  });

  // Load Content prop into editor if it changes externally
  // But prevent loops. Use ref to track if we just updated it ourselves.
  useEffect(() => {
    if (editor && content !== htmlContent) {
      if (!isCodeView) {
        editor.commands.setContent(content, { emitUpdate: false });
      }
      setHtmlContent(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, editor]);

  // Handle Draft Loading
  useEffect(() => {
    if (draftKey) {
      const saved = localStorage.getItem(draftKey);
      if (saved && saved !== '<p></p>' && saved !== '' && saved !== content) {
        setHasDraft(true);
        setDraftContent(saved);
      }
    }
  }, [draftKey, content]);

  // Handle Autosave Drafts
  useEffect(() => {
    if (draftKey && htmlContent && htmlContent !== '<p></p>') {
      const timer = setTimeout(() => {
        localStorage.setItem(draftKey, htmlContent);
      }, 1500); // 1.5s debounce
      return () => clearTimeout(timer);
    }
  }, [htmlContent, draftKey]);

  const handleRestoreDraft = useCallback(() => {
    if (draftContent) {
      if (editor && !isCodeView) {
        editor.commands.setContent(draftContent, { emitUpdate: false });
      }
      setHtmlContent(draftContent);
      onChange(draftContent);
      setHasDraft(false);
    }
  }, [draftContent, editor, isCodeView, onChange]);

  const handleClearDraft = useCallback(() => {
    if (draftKey) localStorage.removeItem(draftKey);
    setHasDraft(false);
  }, [draftKey]);

  const toggleCodeView = useCallback(() => {
    if (isCodeView) {
      // Switching Code -> Visual
      // We pass the raw string back to TipTap
      editor?.commands.setContent(htmlContent, { emitUpdate: false });
    } else {
      // Switching Visual -> Code
      // Ensure the text area gets the absolute latest from the visual editor
      setHtmlContent(editor?.getHTML() || '');
    }
    setIsCodeView(!isCodeView);
  }, [isCodeView, htmlContent, editor]);

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setHtmlContent(val);
    onChange(val);
  };

  const addImage = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0];
        setIsUploading(true);
        try {
          const { signature, timestamp, apiKey, cloudName, uploadPreset, folder } = await getCloudinarySignature('blog-content');
          
          const formData = new FormData();
          formData.append('file', file);
          formData.append('signature', signature);
          formData.append('timestamp', timestamp.toString());
          formData.append('api_key', apiKey || '');
          formData.append('upload_preset', uploadPreset || '');
          if (folder) formData.append('folder', folder);

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: 'POST', body: formData }
          );
          
          const data = await response.json();
          if (data.secure_url) {
            editor?.chain().focus().setImage({ src: data.secure_url }).run();
          }
        } catch (error) {
          console.error('Image upload failed:', error);
        } finally {
          setIsUploading(false);
        }
      }
    };
    input.click();
  }, [editor]);

  const openLinkModal = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setLinkModalOpen(true);
  }, [editor]);

  const saveLink = useCallback(() => {
    if (linkUrl === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setLinkModalOpen(false);
  }, [editor, linkUrl]);

  if (!editor) return null;

  return (
    <div className="flex flex-col border border-border-subtle rounded-3xl overflow-hidden bg-surface group focus-within:border-primary/40 transition-all shadow-sm">
      <style dangerouslySetInnerHTML={{ __html: EDITOR_STYLES }} />
      
      {/* Draft Notification */}
      <AnimatePresence>
        {hasDraft && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-primary/5 border-b border-primary/20 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-sm"
          >
            <div className="flex items-center gap-2 font-bold text-primary">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>يوجد مسودة غير محفوظة (تم الكتابة سابقاً)</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={handleRestoreDraft}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-white shadow shadow-primary/20 hover:bg-primary-hover transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                استعادة المسودة
              </button>
              <button 
                type="button"
                onClick={handleClearDraft}
                className="rounded-lg border border-border-subtle hover:border-error/40 px-3 py-1.5 text-xs font-bold text-text-secondary hover:text-error transition-colors"
              >
                تجاهل
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Link Modal */}
      <AnimatePresence>
        {linkModalOpen && (
          <div className="fixed inset-0 z-99999 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLinkModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-surface rounded-[32px] p-6 shadow-2xl border border-border-subtle"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-black text-text-primary">إضافة رابط</h3>
                <button 
                  onClick={() => setLinkModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-elevated text-text-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-wider">الرابط (URL)</label>
                  <input
                    autoFocus
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveLink()}
                    placeholder="https://example.com"
                    className="w-full rounded-2xl border border-border-subtle bg-elevated px-4 py-3 text-sm outline-none transition focus:border-primary/40"
                    dir="ltr"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={saveLink}
                    className="flex-1 rounded-2xl bg-primary py-3 text-sm font-black text-white shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
                  >
                    حفظ الرابط
                  </button>
                  <button
                    onClick={() => {
                      setLinkUrl('');
                      saveLink();
                    }}
                    className="px-4 rounded-2xl border border-border-subtle text-text-secondary hover:text-error hover:border-error/30 transition-all"
                    title="حذف الرابط"
                  >
                    إزالة
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border-subtle bg-elevated/50 backdrop-blur-md sticky top-0 z-10" dir="rtl">
        {!isCodeView ? (
          <>
            <MenuButton 
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="خط عريض"
            >
              <Bold className="w-4 h-4" />
            </MenuButton>
            <MenuButton 
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="خط مائل"
            >
              <Italic className="w-4 h-4" />
            </MenuButton>
            <MenuButton 
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="خط تحته خط"
            >
              <UnderlineIcon className="w-4 h-4" />
            </MenuButton>
            
            <div className="w-px h-6 bg-border-subtle mx-1" />

            <MenuButton 
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              title="عنوان رئيسي"
            >
              <Heading1 className="w-4 h-4" />
            </MenuButton>
            <MenuButton 
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              title="عنوان فرعي"
            >
              <Heading2 className="w-4 h-4" />
            </MenuButton>
            <MenuButton 
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              title="عنوان صغير"
            >
              <Heading3 className="w-4 h-4" />
            </MenuButton>

            <div className="w-px h-6 bg-border-subtle mx-1" />

            <MenuButton 
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="قائمة نقطية"
            >
              <List className="w-4 h-4" />
            </MenuButton>
            <MenuButton 
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="قائمة رقمية"
            >
              <ListOrdered className="w-4 h-4" />
            </MenuButton>
            <MenuButton 
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="اقتباس"
            >
              <Quote className="w-4 h-4" />
            </MenuButton>

            <div className="w-px h-6 bg-border-subtle mx-1" />

            <MenuButton 
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              title="محاذاة لليمين"
            >
              <AlignRight className="w-4 h-4" />
            </MenuButton>
            <MenuButton 
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              title="توسيط"
            >
              <AlignCenter className="w-4 h-4" />
            </MenuButton>
            <MenuButton 
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              title="محاذاة لليسار"
            >
              <AlignLeft className="w-4 h-4" />
            </MenuButton>

            <div className="w-px h-6 bg-border-subtle mx-1" />

            <MenuButton 
              onClick={openLinkModal}
              isActive={editor.isActive('link')}
              title="إضافة رابط"
            >
              <LinkIcon className="w-4 h-4" />
            </MenuButton>
            
            <MenuButton 
              onClick={addImage}
              disabled={isUploading}
              title="إضافة صورة"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
            </MenuButton>

            <div className="w-px h-6 bg-border-subtle mx-1" />

            <MenuButton 
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="تراجع"
            >
              <Undo className="w-4 h-4" />
            </MenuButton>
            <MenuButton 
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="إعادة"
            >
              <Redo className="w-4 h-4" />
            </MenuButton>
          </>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase text-primary tracking-widest bg-primary/5 rounded-lg border border-primary/20">
            <FileCode className="w-3.5 h-3.5" />
            وضع تحرير الكود (HTML) نشط الآن
          </div>
        )}

        <div className="flex-1" />

        <MenuButton 
          onClick={toggleCodeView}
          isActive={isCodeView}
          variant="primary"
          title={isCodeView ? 'تفعيل العرض المرئي' : 'تفعيل وضع الكود (HTML)'}
        >
          {isCodeView ? <Code className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
        </MenuButton>
      </div>

      {/* Editor Content Area */}
      <div className="min-h-[400px] w-full bg-surface">
        {isCodeView ? (
          <textarea
            dir="ltr"
            value={htmlContent}
            onChange={handleHtmlChange}
            placeholder="اكتب كود HTML هنا..."
            className="w-full min-h-[400px] p-6 bg-surface font-mono text-sm leading-relaxed outline-none focus:bg-elevated/50 transition-colors text-text-primary resize-none border-none"
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>
      
      {/* Meta Footer */}
      <div className="px-4 py-2 border-t border-border-subtle bg-elevated/30 flex justify-between items-center">
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
          {hasDraft && <span className="text-primary mr-2">جاري الحفظ التلقائي...</span>}
          {isCodeView ? htmlContent.length : (editor.storage.characterCount?.words?.() || 0)} {isCodeView ? 'حرف' : 'كلمة'} | {isCodeView ? Math.round(htmlContent.length / 6) : editor.getText().length} {isCodeView ? 'كلمة تقريبية' : 'حرف'}
        </div>
        <div className="text-[10px] font-black text-text-secondary disabled:opacity-50 uppercase">
          {isCodeView ? 'Source Code Mode' : 'Visual Mode'}
        </div>
      </div>
    </div>
  );
}

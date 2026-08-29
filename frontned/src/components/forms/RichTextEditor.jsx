import { useEffect, useRef } from 'react';
import { Box, Divider, IconButton, Stack, Tooltip } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';

/**
 * Lightweight contentEditable rich text editor (no extra dependency).
 */
export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Write day description...',
  minHeight = 160,
  disabled = false,
}) {
  const ref = useRef(null);
  const lastExternal = useRef(value);

  useEffect(() => {
    if (!ref.current) return;
    if (value !== lastExternal.current && value !== ref.current.innerHTML) {
      ref.current.innerHTML = value || '';
      lastExternal.current = value;
    }
  }, [value]);

  const exec = (command, arg = null) => {
    if (disabled) return;
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  const emit = () => {
    const html = ref.current?.innerHTML || '';
    lastExternal.current = html;
    onChange?.(html);
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL');
    if (url) exec('createLink', url);
  };

  const insertImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) exec('insertImage', url);
  };

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: '#fff',
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <Stack
        direction="row"
        spacing={0.25}
        sx={{ px: 0.75, py: 0.5, bgcolor: 'rgba(240,244,248,0.9)' }}
      >
        <Tooltip title="Bold">
          <IconButton size="small" onClick={() => exec('bold')} disabled={disabled}>
            <FormatBoldIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic">
          <IconButton size="small" onClick={() => exec('italic')} disabled={disabled}>
            <FormatItalicIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Underline">
          <IconButton size="small" onClick={() => exec('underline')} disabled={disabled}>
            <FormatUnderlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="Bullet list">
          <IconButton size="small" onClick={() => exec('insertUnorderedList')} disabled={disabled}>
            <FormatListBulletedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Numbered list">
          <IconButton size="small" onClick={() => exec('insertOrderedList')} disabled={disabled}>
            <FormatListNumberedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="Hyperlink">
          <IconButton size="small" onClick={insertLink} disabled={disabled}>
            <InsertLinkIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Image">
          <IconButton size="small" onClick={insertImage} disabled={disabled}>
            <ImageOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Box
        ref={ref}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        data-placeholder={placeholder}
        sx={{
          minHeight,
          px: 1.5,
          py: 1.25,
          outline: 'none',
          fontSize: '0.95rem',
          lineHeight: 1.6,
          '&:empty:before': {
            content: 'attr(data-placeholder)',
            color: 'text.disabled',
          },
          '& img': { maxWidth: '100%', borderRadius: 1 },
          '& a': { color: 'primary.main' },
        }}
      />
    </Box>
  );
}

import React from 'react';
import { CheckCircle2, MoreHorizontal, ThumbsUp, ThumbsDown } from 'lucide-react';
import robuxSvg from '../assets/robux.svg';
import { GamepassData } from '../services/robloxService';

interface GamepassPreviewProps {
  data: GamepassData | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const GamepassPreview: React.FC<GamepassPreviewProps> = ({ data, containerRef }) => {
  if (!data) return null;

  const getFontSize = (name: string) => {
    if (name.length <= 15) return '52px';
    if (name.length <= 25) return '42px';
    if (name.length <= 40) return '34px';
    if (name.length <= 60) return '28px';
    return '22px';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '1080px',
        backgroundColor: '#ffffffff',
        color: '#202227',
        fontFamily: "'Gill Sans', sans-serif",
        padding: '30px 40px',
        display: 'flex',
        gap: '40px',
        userSelect: 'none',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* ═══════════════════════════════
          LEFT COLUMN: image card + likes
          ═══════════════════════════════ */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '400px', flexShrink: 0 }}>

        {/* Image card */}
        <div style={{
          flex: 1,
          backgroundColor: '#f7f7f8',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '460px',
        }}>
          <img
            src={data.iconUrl}
            alt={data.name}
            style={{ width: '200px', height: '160px', objectFit: 'contain' }}
          />

          {/* "Use this Pass in" footer bar */}
          <div style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            backgroundColor: '#bfbfc0',
            borderTop: '1px solid #bfbfc0',
            height: '68px',
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ paddingRight: '10px', paddingBottom: '22px', fontSize: '14px', color: '#202227' }}>
              Use this Pass in: <strong>{data.gameName}</strong>
            </span>

            {/* Experience thumbnail — always a visible box */}
            <div style={{
              width: '52px',
              height: '52px',
              overflow: 'hidden',
              backgroundColor: '#2d2f36',
              flexShrink: 0
            }}>
              {data.gameIconUrl
                ? <img src={data.gameIconUrl} alt={data.gameName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : null
              }
            </div>
          </div>
        </div>

        {/* Like / Dislike row — sits right under the image card */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-evenly',
          alignItems: 'left',
          paddingTop: '10px',
          paddingBottom: '4px',
          paddingLeft: '170px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#202227' }}>
            <ThumbsUp size={20} />
            <span style={{ fontSize: '16px' }}>0</span>
          </div>

          {/* Vertical divider bar in the middle */}
          <div style={{ height: '6px', width: '150px', backgroundColor: '#f0f0f0ff' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#202227' }}>
            <span style={{ fontSize: '16px' }}>0</span>
            <ThumbsDown size={20} />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════
          RIGHT COLUMN: details
          ═══════════════════════════════ */}
      <div style={{ flex: 1 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h1 style={{ 
            fontSize: getFontSize(data.name), 
            margin: 0, 
            fontWeight: 650, 
            lineHeight: 1.1, 
            color: '#202227',
            wordBreak: 'break-word',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            maxHeight: '180px'
          }}>
            {data.name}
          </h1>
          <MoreHorizontal size={28} color="#202227" style={{ marginTop: '10px', flexShrink: 0 }} />
        </div>

        {/* Owner + Item Owned badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0 16px', fontSize: '18px' }}>
          <span style={{ color: '#0d0e10ff' }}>By @{data.username}</span>
          <CheckCircle2 size={20} fill="#00b06f" stroke="#fff" />
          <span style={{ color: '#202227', fontWeight: 600 }}>Item Owned</span>
        </div>

        {/* Divider */}
        <div style={{ borderWidth: '5px', borderTop: '4px solid #bfbfc0', marginBottom: '20px' }} />

        {/* Inventory row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <span style={{ fontSize: '18px', color: '#0d0e10ff' }}>This item is available in your inventory.</span>
          <button style={{
            backgroundColor: '#e3e4e9',
            color: '#202227',
            border: 'none',
            padding: '12px 50px',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 650,
            cursor: 'pointer',
            flexShrink: 0,
            marginLeft: '16px'
          }}>
            Inventory
          </button>
        </div>

        {/* Info table — left-aligned, starts at same X as the inventory text above */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '90px auto',
            justifyContent: 'start',
            gap: '16px 24px',
            fontSize: '19px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', color: '#202227' }}>Price</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <img src={robuxSvg} alt="Robux" style={{ width: '22px', height: '22px' }} />
            <span style={{ fontSize: '22px' }}>{data.price}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', color: '#202227' }}>Type</div>
          <div style={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
            <span>Pass</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', color: '#202227' }}>Updated</div>
          <div style={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
            <span>{formatDate(data.updated)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamepassPreview;

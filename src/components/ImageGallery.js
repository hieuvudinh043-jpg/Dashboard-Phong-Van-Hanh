'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function ImageGallery({ currentWeek, sheetName }) {
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [origin, setOrigin] = useState('50% 50%');
  
  const fileInputRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0, moved: false });

  const handlePointerDown = (e) => {
    if (zoomScale > 1) {
      isDraggingRef.current = true;
      dragStartRef.current = { 
        x: e.clientX - pan.x, 
        y: e.clientY - pan.y, 
        startX: e.clientX, 
        startY: e.clientY,
        moved: false 
      };
      e.target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (isDraggingRef.current && zoomScale > 1) {
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        dragStartRef.current.moved = true;
      }
      setPan({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y });
    }
  };

  const handlePointerUp = (e) => {
    isDraggingRef.current = false;
    e.target.releasePointerCapture(e.pointerId);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (dragStartRef.current.moved && zoomScale > 1) {
      dragStartRef.current.moved = false; // Reset sau khi drag
      return; // Không zoom out nếu vừa kéo ảnh
    }
    
    if (zoomScale === 1) {
      // Tính toán tọa độ phần trăm click chuột so với ảnh để làm tâm Zoom
      const rect = e.target.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      const originX = (offsetX / rect.width) * 100;
      const originY = (offsetY / rect.height) * 100;
      setOrigin(`${originX}% ${originY}%`);
      
      setZoomScale(2.5); // Phóng to 2.5x cho rõ
      setPan({ x: 0, y: 0 });
    } else {
      setZoomScale(1);
      setPan({ x: 0, y: 0 });
      // Trả lại tâm mặc định khi thu nhỏ
      setTimeout(() => setOrigin('50% 50%'), 200);
    }
  };

  useEffect(() => {
    if (currentWeek && sheetName) {
      fetchImages();
    }
  }, [currentWeek, sheetName]);

  const fetchImages = async () => {
    try {
      const res = await fetch(`/api/images?week=${encodeURIComponent(currentWeek)}&sheet=${encodeURIComponent(sheetName)}`);
      const data = await res.json();
      if (data.success) {
        setImages(data.images || []);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách ảnh:", err);
    }
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('week', currentWeek);
    formData.append('sheet', sheetName);
    
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setImages(data.images);
      } else {
        alert("Lỗi tải ảnh: " + data.error);
      }
    } catch (err) {
      console.error("Lỗi tải ảnh:", err);
      alert("Lỗi tải ảnh!");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (filename, e) => {
    e.stopPropagation(); // Ngăn sự kiện click zoom
    if (!confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;

    try {
      const res = await fetch(`/api/images?week=${encodeURIComponent(currentWeek)}&sheet=${encodeURIComponent(sheetName)}&filename=${encodeURIComponent(filename)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setImages(images.filter(img => img.filename !== filename));
      }
    } catch (err) {
      console.error("Lỗi xóa ảnh:", err);
    }
  };

  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--glass-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🖼️ {sheetName.toLowerCase().includes('năng suất') ? 'Năng suất nhân sự' : 'Hình ảnh đính kèm'}
        </h3>
        
        <div>
          <input 
            type="file" 
            multiple 
            accept="image/png, image/jpeg" 
            style={{ display: 'none' }} 
            ref={fileInputRef}
            onChange={handleUpload}
          />
          <button 
            className="btn-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? '⏳ Đang tải lên...' : '➕ Thêm Ảnh'}
          </button>
        </div>
      </div>

      {images.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', border: '2px dashed var(--glass-border)', borderRadius: '8px' }}>
          Chưa có hình ảnh nào được tải lên cho báo cáo này.
        </div>
      ) : (
        <div style={{
          display: images.length === 1 ? 'block' : 'grid',
          gridTemplateColumns: images.length === 1 ? 'none' : 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {images.map((img, index) => (
            <div 
              key={index} 
              style={{
                position: 'relative', 
                borderRadius: '8px', 
                overflow: 'hidden',
                cursor: 'zoom-in',
                border: '1px solid var(--glass-border)',
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: images.length === 1 ? 'auto' : '300px'
              }}
              onClick={() => { setZoomedImage(img.url); setZoomScale(1); }}
              className="gallery-image-container"
            >
              {/* Nút xóa hiện ra khi hover (dùng CSS class gallery-delete-btn) */}
              <button 
                className="gallery-delete-btn"
                onClick={(e) => handleDelete(img.filename, e)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(255, 50, 50, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                }}
                title="Xóa ảnh"
              >
                🗑️
              </button>
              
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={img.url} 
                alt="Đính kèm" 
                style={{ 
                  width: '100%', 
                  height: images.length === 1 ? 'auto' : '100%',
                  maxHeight: images.length === 1 ? '70vh' : 'none',
                  objectFit: images.length === 1 ? 'contain' : 'cover',
                  display: 'block'
                }} 
              />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Zoom */}
      {zoomedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out'
          }}
          onClick={() => { setZoomedImage(null); setZoomScale(1); }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={zoomedImage} 
            alt="Zoomed" 
            style={{ 
              maxWidth: '95%', 
              maxHeight: '95%',
              objectFit: 'contain',
              boxShadow: '0 0 20px rgba(0,0,0,0.5)',
              transformOrigin: origin,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomScale})`,
              transition: isDraggingRef.current ? 'none' : 'transform 0.2s ease-in-out',
              cursor: zoomScale === 1 ? 'zoom-in' : (isDraggingRef.current ? 'grabbing' : 'grab'),
              userSelect: 'none',
              touchAction: 'none' // Chống scroll trình duyệt trên mobile khi kéo
            }} 
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={handleImageClick}
          />
          <button 
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              color: 'white',
              border: 'none',
              fontSize: '2rem',
              cursor: 'pointer'
            }}
            onClick={() => { setZoomedImage(null); setZoomScale(1); }}
          >
            ×
          </button>
        </div>
      )}

      {/* CSS inline cho hiệu ứng hover nút xóa */}
      <style dangerouslySetInnerHTML={{__html: `
        .gallery-image-container:hover .gallery-delete-btn {
          opacity: 1 !important;
        }
        .gallery-delete-btn:hover {
          background: #ff0000 !important;
          transform: scale(1.1);
        }
      `}} />
    </div>
  );
}

import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio.v3 as iio

WIDTH = 1280
HEIGHT = 720
FPS = 24
SECONDS_PER_SLIDE = 5
TRANSITION_FRAMES = 12  # 0.5s fade transition

FONT_DIR = "C:/Windows/Fonts"
font_title = ImageFont.truetype(os.path.join(FONT_DIR, "arialbd.ttf"), 38)
font_subtitle = ImageFont.truetype(os.path.join(FONT_DIR, "arialbd.ttf"), 22)
font_heading = ImageFont.truetype(os.path.join(FONT_DIR, "arialbd.ttf"), 28)
font_body = ImageFont.truetype(os.path.join(FONT_DIR, "arial.ttf"), 20)
font_bold = ImageFont.truetype(os.path.join(FONT_DIR, "arialbd.ttf"), 20)
font_small = ImageFont.truetype(os.path.join(FONT_DIR, "arial.ttf"), 16)
font_badge = ImageFont.truetype(os.path.join(FONT_DIR, "arialbd.ttf"), 14)

def create_base_canvas():
    img = Image.new("RGB", (WIDTH, HEIGHT), (15, 23, 42))  # slate-900
    draw = ImageDraw.Draw(img)
    # Background subtle gradient and grid
    for y in range(HEIGHT):
        r = int(15 + (y / HEIGHT) * 10)
        g = int(23 + (y / HEIGHT) * 12)
        b = int(42 + (y / HEIGHT) * 20)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))
    
    # Top header bar
    draw.rectangle([(0, 0), (WIDTH, 70)], fill=(10, 15, 30))
    draw.line([(0, 70), (WIDTH, 70)], fill=(30, 41, 59), width=2)
    
    # Header badge
    draw.rounded_rectangle([(40, 18), (170, 52)], radius=8, fill=(79, 70, 229))
    draw.text((55, 25), "WORKSPHERE", font=font_badge, fill=(255, 255, 255))
    
    draw.text((190, 25), "PROJECT DELIVERABLE • TASK 2 WALKTHROUGH", font=font_badge, fill=(148, 163, 184))
    
    # Intern info badge on right
    draw.rounded_rectangle([(WIDTH - 280, 18), (WIDTH - 40, 52)], radius=8, fill=(30, 41, 59))
    draw.text((WIDTH - 265, 25), "INTERN: @Chinmaykv", font=font_badge, fill=(226, 232, 240))
    
    # Footer bar
    draw.rectangle([(0, HEIGHT - 45), (WIDTH, HEIGHT)], fill=(10, 15, 30))
    draw.line([(0, HEIGHT - 45), (WIDTH, HEIGHT - 45)], fill=(30, 41, 59), width=2)
    draw.text((40, HEIGHT - 33), "Task ID: TSK-002 • Software Requirements Specification (SRS) • Diabetic Retinopathy System", font=font_small, fill=(100, 116, 139))
    draw.text((WIDTH - 220, HEIGHT - 33), "WorkSphere Evaluation", font=font_small, fill=(100, 116, 139))
    
    return img

def render_slide_1():
    img = create_base_canvas()
    draw = ImageDraw.Draw(img)
    
    # Card container
    draw.rounded_rectangle([(80, 110), (WIDTH - 80, HEIGHT - 80)], radius=20, fill=(24, 33, 56), outline=(51, 65, 85), width=2)
    
    # Title Tag
    draw.rounded_rectangle([(120, 150), (320, 185)], radius=8, fill=(225, 29, 72))  # rose-600
    draw.text((135, 158), "SUBMITTED DELIVERABLE", font=font_badge, fill=(255, 255, 255))
    
    # Main Title
    draw.text((120, 210), "Task 2: Creation of SRS Document", font=font_title, fill=(255, 255, 255))
    draw.text((120, 265), "Web-Based Diabetic Retinopathy Image Processing System", font=font_subtitle, fill=(129, 140, 248))
    
    # Divider
    draw.line([(120, 315), (WIDTH - 120, 315)], fill=(51, 65, 85), width=2)
    
    # Info Columns
    # Left Column
    draw.text((120, 345), "DOCUMENT OVERVIEW & PURPOSE", font=font_heading, fill=(241, 245, 249))
    draw.text((120, 395), "• Comprehensive 8-page Software Requirements Specification (SRS.pdf)", font=font_body, fill=(203, 213, 225))
    draw.text((120, 435), "• Standardized IEEE 830-1998 Software Specification Structure", font=font_body, fill=(203, 213, 225))
    draw.text((120, 475), "• Clinical workflows for early diabetic microaneurysm & exudate detection", font=font_body, fill=(203, 213, 225))
    draw.text((120, 515), "• Multi-class severity classification (No DR, Mild, Moderate, Severe, PDR)", font=font_body, fill=(203, 213, 225))
    
    # Right Column: Metadata Box
    draw.rounded_rectangle([(WIDTH - 420, 340), (WIDTH - 120, 570)], radius=16, fill=(15, 23, 42), outline=(79, 70, 229), width=2)
    draw.text((WIDTH - 395, 365), "SUBMISSION METADATA", font=font_badge, fill=(165, 180, 252))
    
    meta_items = [
        ("Author:", "Chinmay K V (@Chinmaykv)"),
        ("Track:", "Full-Stack Software Eng."),
        ("Document:", "SRS.pdf (Version 1.0)"),
        ("Status:", "SUBMITTED FOR REVIEW"),
        ("Date:", "August 31, 2026"),
        ("Verification:", "Verified Deliverable Asset")
    ]
    y_pos = 405
    for lbl, val in meta_items:
        draw.text((WIDTH - 395, y_pos), lbl, font=font_small, fill=(148, 163, 184))
        draw.text((WIDTH - 395, y_pos + 18), val, font=font_bold, fill=(248, 250, 252))
        y_pos += 45
        
    return img

def render_slide_2():
    img = create_base_canvas()
    draw = ImageDraw.Draw(img)
    
    # Header
    draw.text((80, 100), "1. CLINICAL OBJECTIVES & SCOPE", font=font_title, fill=(255, 255, 255))
    draw.text((80, 150), "Addressing early screening bottlenecks in preventable diabetic vision loss", font=font_body, fill=(148, 163, 184))
    
    # 3 Objective Cards
    cards = [
        ("Problem Statement", "Manual fundus screening is slow, requires scarce specialist ophthalmologists, and suffers from inter-observer grading variability across healthcare centers.", (239, 68, 68)),
        ("Core Objectives", "Deliver an accessible web application allowing clinic technicians to upload retinal fundus images and receive deep-learning grading in under 2.5 seconds.", (79, 70, 229)),
        ("Expected Output", "Automated DR severity classification (Stage 0-4), localized Grad-CAM heatmaps showing microaneurysms, and generated PDF clinical referral summaries.", (16, 185, 129))
    ]
    
    card_w = 345
    for i, (title, desc, accent) in enumerate(cards):
        x = 80 + i * (card_w + 35)
        # Card body
        draw.rounded_rectangle([(x, 210), (x + card_w, 580)], radius=16, fill=(24, 33, 56), outline=(51, 65, 85), width=2)
        # Accent top bar
        draw.rounded_rectangle([(x, 210), (x + card_w, 220)], radius=4, fill=accent)
        # Title
        draw.text((x + 24, 240), title, font=font_heading, fill=(255, 255, 255))
        # Divider
        draw.line([(x + 24, 280), (x + card_w - 24, 280)], fill=(51, 65, 85), width=1)
        
        # Wrapped text description
        words = desc.split()
        lines = []
        curr = ""
        for w in words:
            if len(curr + " " + w) > 28:
                lines.append(curr)
                curr = w
            else:
                curr = (curr + " " + w).strip()
        if curr:
            lines.append(curr)
            
        y_text = 305
        for line in lines:
            draw.text((x + 24, y_text), line, font=font_body, fill=(203, 213, 225))
            y_text += 32
            
    return img

def render_slide_3():
    img = create_base_canvas()
    draw = ImageDraw.Draw(img)
    
    # Header
    draw.text((80, 100), "2. SYSTEM PIPELINE & WORKFLOW ARCHITECTURE", font=font_title, fill=(255, 255, 255))
    draw.text((80, 150), "End-to-end retinal image processing and clinical inference workflow", font=font_body, fill=(148, 163, 184))
    
    # 4 Architecture Stages
    stages = [
        ("STAGE 1", "Image Ingestion", "High-resolution fundus upload (TIFF/PNG/JPEG) with EXIF sanitization and resolution validation.", (79, 70, 229)),
        ("STAGE 2", "Preprocessing", "CLAHE contrast equalization, green channel extraction, circular retina mask cropping, normalization.", (14, 165, 233)),
        ("STAGE 3", "AI Inference", "Deep convolutional neural network (EfficientNet / ResNet-50) evaluating vascular pathology & exudates.", (168, 85, 247)),
        ("STAGE 4", "Report Export", "Grad-CAM visual heatmap generation, clinical severity grading (0 to 4), instant PDF export for doctors.", (16, 185, 129))
    ]
    
    box_w = 260
    for i, (tag, title, desc, col) in enumerate(stages):
        x = 80 + i * (box_w + 24)
        draw.rounded_rectangle([(x, 210), (x + box_w, 580)], radius=16, fill=(24, 33, 56), outline=(51, 65, 85), width=2)
        # Stage Pill
        draw.rounded_rectangle([(x + 20, 230), (x + 110, 258)], radius=6, fill=col)
        draw.text((x + 28, 236), tag, font=font_badge, fill=(255, 255, 255))
        
        draw.text((x + 20, 275), title, font=font_heading, fill=(255, 255, 255))
        draw.line([(x + 20, 315), (x + box_w - 20, 315)], fill=(51, 65, 85), width=1)
        
        words = desc.split()
        lines = []
        curr = ""
        for w in words:
            if len(curr + " " + w) > 22:
                lines.append(curr)
                curr = w
            else:
                curr = (curr + " " + w).strip()
        if curr:
            lines.append(curr)
            
        y_text = 335
        for line in lines:
            draw.text((x + 20, y_text), line, font=font_body, fill=(203, 213, 225))
            y_text += 30
            
    return img

def render_slide_4():
    img = create_base_canvas()
    draw = ImageDraw.Draw(img)
    
    # Header
    draw.text((80, 100), "3. REQUIREMENTS & TECHNOLOGY SPECIFICATION", font=font_title, fill=(255, 255, 255))
    draw.text((80, 150), "Functional guarantees, clinical compliance, and proposed technology stack", font=font_body, fill=(148, 163, 184))
    
    # Two Columns: Functional vs Tech Stack
    # Left Column: Functional & Non-Functional
    draw.rounded_rectangle([(80, 200), (WIDTH // 2 - 20, 580)], radius=16, fill=(24, 33, 56), outline=(51, 65, 85), width=2)
    draw.text((110, 225), "FUNCTIONAL & COMPLIANCE REQS", font=font_heading, fill=(129, 140, 248))
    
    reqs = [
        "• Role-Based Access: Clinician, Screening Tech, Administrator",
        "• Real-Time Processing: Complete inference cycle in < 2.5s",
        "• Lesion Segmentation: Microaneurysm & hemorrhage mapping",
        "• Clinical Referral Flag: Highlighting severe cases immediately",
        "• Data Security: AES-256 encrypted storage, HIPAA compliant",
        "• Cross-Platform: Responsive web UI for desktop and tablets"
    ]
    y_req = 275
    for r in reqs:
        draw.text((110, y_req), r, font=font_body, fill=(226, 232, 240))
        y_req += 45
        
    # Right Column: Tech Stack
    draw.rounded_rectangle([(WIDTH // 2 + 20, 200), (WIDTH - 80, 580)], radius=16, fill=(24, 33, 56), outline=(51, 65, 85), width=2)
    draw.text((WIDTH // 2 + 50, 225), "PROPOSED TECHNOLOGY STACK", font=font_heading, fill=(16, 185, 129))
    
    techs = [
        ("Frontend Application:", "React 18, Tailwind CSS, Recharts, Lucide"),
        ("Backend Services:", "Python FastAPI & Spring Boot REST API"),
        ("Deep Learning Pipeline:", "PyTorch, TorchVision, OpenCV, Grad-CAM"),
        ("Database Layer:", "MongoDB Atlas (Deliverables) & PostgreSQL"),
        ("Cloud Infrastructure:", "Docker containers, Vercel Edge Serverless"),
        ("Testing & Quality:", "Unit tests, Model Validation on Kaggle APTOS")
    ]
    y_tech = 275
    for title, desc in techs:
        draw.text((WIDTH // 2 + 50, y_tech), title, font=font_small, fill=(148, 163, 184))
        draw.text((WIDTH // 2 + 50, y_tech + 18), desc, font=font_bold, fill=(241, 245, 249))
        y_tech += 48
        
    return img

def render_slide_5():
    img = create_base_canvas()
    draw = ImageDraw.Draw(img)
    
    # Success / Completion Card
    draw.rounded_rectangle([(150, 130), (WIDTH - 150, HEIGHT - 90)], radius=20, fill=(24, 33, 56), outline=(16, 185, 129), width=2)
    
    # Success Badge
    draw.rounded_rectangle([(WIDTH // 2 - 140, 160), (WIDTH // 2 + 140, 198)], radius=10, fill=(16, 185, 129))
    draw.text((WIDTH // 2 - 120, 170), "✓ TASK 2 DELIVERABLE COMPLETE", font=font_badge, fill=(255, 255, 255))
    
    draw.text((WIDTH // 2 - 310, 220), "SRS Document Evaluation Ready", font=font_title, fill=(255, 255, 255))
    draw.text((WIDTH // 2 - 340, 275), "Diabetic Retinopathy Web System Specification Successfully Formulated", font=font_subtitle, fill=(148, 163, 184))
    
    draw.line([(200, 325), (WIDTH - 200, 325)], fill=(51, 65, 85), width=2)
    
    # Key Summary Boxes
    boxes = [
        ("8 Pages", "Comprehensive SRS Specification Document (SRS.pdf)"),
        ("5 Modules", "Detailed Functional & Non-Functional Requirements"),
        ("@Chinmaykv", "Author & Candidate Deliverable Walkthrough")
    ]
    box_w = 260
    for i, (top, bottom) in enumerate(boxes):
        bx = 200 + i * (box_w + 40)
        draw.rounded_rectangle([(bx, 360), (bx + box_w, 480)], radius=12, fill=(15, 23, 42), outline=(51, 65, 85), width=1)
        draw.text((bx + 20, 380), top, font=font_heading, fill=(129, 140, 248))
        words = bottom.split()
        lines = []
        curr = ""
        for w in words:
            if len(curr + " " + w) > 22:
                lines.append(curr)
                curr = w
            else:
                curr = (curr + " " + w).strip()
        if curr:
            lines.append(curr)
        yt = 420
        for l in lines:
            draw.text((bx + 20, yt), l, font=font_small, fill=(203, 213, 225))
            yt += 22
            
    draw.text((WIDTH // 2 - 250, 520), "Ready for Official WorkSphere Administrative Review & Certification", font=font_bold, fill=(52, 211, 153))
    return img

def generate_video():
    print("Rendering slides...")
    slides = [
        render_slide_1(),
        render_slide_2(),
        render_slide_3(),
        render_slide_4(),
        render_slide_5()
    ]
    
    slide_arrays = [np.array(s) for s in slides]
    total_slides = len(slides)
    frames_per_slide = FPS * SECONDS_PER_SLIDE
    total_frames = total_slides * frames_per_slide
    
    output_path = "scratch/chinmaykv_srs_walkthrough.mp4"
    print(f"Generating video with {total_frames} frames ({total_slides * SECONDS_PER_SLIDE} seconds)...")
    
    all_frames = []
    
    for s_idx in range(total_slides):
        curr_slide = slide_arrays[s_idx]
        next_slide = slide_arrays[(s_idx + 1) % total_slides]
        
        for f in range(frames_per_slide):
            global_frame = s_idx * frames_per_slide + f
            progress = global_frame / total_frames
            
            # Transition check
            if f >= frames_per_slide - TRANSITION_FRAMES and s_idx < total_slides - 1:
                t = (f - (frames_per_slide - TRANSITION_FRAMES)) / TRANSITION_FRAMES
                # Cross-fade
                frame = ((1 - t) * curr_slide + t * next_slide).astype(np.uint8)
            else:
                frame = curr_slide.copy()
                
            # Add dynamic animated progress bar at the very bottom
            prog_img = Image.fromarray(frame)
            p_draw = ImageDraw.Draw(prog_img)
            bar_w = int(progress * WIDTH)
            p_draw.rectangle([(0, HEIGHT - 5), (bar_w, HEIGHT)], fill=(225, 29, 72))  # rose-600 active bar
            
            all_frames.append(np.array(prog_img))
            
    print(f"Encoding {len(all_frames)} frames to H.264 MP4 using imageio...")
    iio.imwrite(
        output_path,
        all_frames,
        fps=FPS,
        codec="libx264",
        pixelformat="yuv420p"
    )
    
    stat = os.stat(output_path)
    print(f"Successfully created: {output_path}")
    print(f"Size: {(stat.st_size / (1024 * 1024)):.2f} MB ({stat.st_size} bytes)")

if __name__ == "__main__":
    generate_video()

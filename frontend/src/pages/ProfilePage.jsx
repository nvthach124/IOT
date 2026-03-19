import thachImg from '/assets/images/thach.png';

/**
 * Profile Page - Static profile info & project links
 * Giữ nguyên nội dung từ profile.html - dùng inline styles để khớp chính xác
 */
export default function ProfilePage() {
    return (
        <main className="profile-page-main">
            <section className="profile-glass-card" style={{ borderRadius: '12px', padding: '64px', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Row 1: Avatar + Info */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '64px' }}>
                        {/* Column 1: Avatar + Name */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <div className="avatar-ring">
                                <div style={{ width: '112px', height: '112px', borderRadius: '9999px', overflow: 'hidden', background: 'var(--color-background-dark)' }}>
                                    <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile picture" src={thachImg} />
                                </div>
                            </div>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, textAlign: 'center' }}>Nguyễn Văn Thạch</h2>
                            <span style={{
                                padding: '4px 12px',
                                background: 'rgba(52, 167, 173, 0.2)',
                                color: 'var(--color-primary)',
                                borderRadius: '9999px',
                                fontSize: '12px',
                                fontWeight: 500,
                            }}>
                                IoT Developer
                            </span>
                        </div>

                        {/* Column 2: Info rows */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <InfoRow icon="cake" iconBg="rgba(255, 77, 77, 0.2)" iconColor="var(--color-accent-temp)" label="Ngày sinh" value="01/02/2004" />
                            <InfoRow icon="location_on" iconBg="rgba(52, 167, 173, 0.2)" iconColor="var(--color-primary)" label="Địa chỉ" value="Hà Nội, Việt Nam" />
                            <InfoRow icon="phone" iconBg="rgba(0, 210, 255, 0.2)" iconColor="var(--color-accent-hum)" label="Số điện thoại" value="0973994584" />
                            <InfoRow icon="mail" iconBg="rgba(255, 234, 0, 0.2)" iconColor="var(--color-accent-light)" label="Email" value="thachnv.b22dcpt254@stu.ptit.edu.vn" />
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', width: '100%', background: 'rgba(51, 65, 85, 0.5)' }}></div>

                {/* Row 2: Project Links */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', maxWidth: '42rem' }}>
                        <LinkCard
                            href="https://github.com/nvthach124/IOT"
                            icon={<GitHubIcon />}
                            title="GitHub"
                            subtitle="Source Code"
                        />
                        <LinkCard
                            href="https://www.figma.com/design/pBkf56d03zJQzdujRNsAAY/IOT?node-id=0-1&p=f&t=gW1r9ILDO3HxE8HE-0"
                            icon={<FigmaIcon />}
                            title="Figma"
                            subtitle="UI/UX Design"
                        />
                        <LinkCard
                            href="https://documenter.getpostman.com/view/51724829/2sBXVkB9kL"
                            icon={<PostmanIcon />}
                            title="API Docs"
                            subtitle="Postman"
                        />
                        <LinkCard
                            href="/docs/IOT.pdf"
                            icon={<span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#ef4444' }}>picture_as_pdf</span>}
                            title="Tài liệu PDF"
                            subtitle="Mô tả dự án"
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}

function InfoRow({ icon, iconBg, iconColor, label, value }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: iconBg, borderRadius: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: iconColor, fontSize: '18px' }}>{icon}</span>
            </div>
            <div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>{label}</p>
                <p style={{ fontWeight: 600, fontSize: '14px' }}>{value}</p>
            </div>
        </div>
    );
}

function LinkCard({ href, icon, title, subtitle }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="link-card profile-glass-card"
            style={{ borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
            <div style={{
                width: '40px',
                height: '40px',
                background: 'var(--color-surface)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}>
                {icon}
            </div>
            <div>
                <h4 style={{ fontWeight: 700, fontSize: '14px' }}>{title}</h4>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>{subtitle}</p>
            </div>
        </a>
    );
}

function GitHubIcon() {
    return (
        <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="white">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
    );
}

function FigmaIcon() {
    return (
        <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none">
            <path d="M8 24C10.2091 24 12 22.2091 12 20V16H8C5.79086 16 4 17.7909 4 20C4 22.2091 5.79086 24 8 24Z" fill="#0ACF83" />
            <path d="M4 12C4 9.79086 5.79086 8 8 8H12V16H8C5.79086 16 4 14.2091 4 12Z" fill="#A259FF" />
            <path d="M4 4C4 1.79086 5.79086 0 8 0H12V8H8C5.79086 8 4 6.20914 4 4Z" fill="#F24E1E" />
            <path d="M12 0H16C18.2091 0 20 1.79086 20 4C20 6.20914 18.2091 8 16 8H12V0Z" fill="#FF7262" />
            <path d="M20 12C20 14.2091 18.2091 16 16 16C13.7909 16 12 14.2091 12 12C12 9.79086 13.7909 8 16 8C18.2091 8 20 9.79086 20 12Z" fill="#1ABCFE" />
        </svg>
    );
}

function PostmanIcon() {
    return (
        <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#FF6C37" />
            <path d="M12 6.5L12 12L16.5 14.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="2" fill="white" />
        </svg>
    );
}

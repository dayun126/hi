// 主题设置（立即执行，防止闪烁）
(function() {
    // 默认深色模式（如果未设置）
    const isDarkMode = localStorage.getItem('darkMode') !== 'false';
    document.documentElement.classList.toggle('dark-mode', isDarkMode);
    if (localStorage.getItem('darkMode') === null) {
        localStorage.setItem('darkMode', 'true');
    }
})();

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化年份显示
    const startYear = 2025;
    const currentYear = new Date().getFullYear();
    document.getElementById('year').textContent = 
        currentYear > startYear ? `${startYear}-${currentYear}` : startYear;

    // 初始化各模块
    initTheme();
    initMobileMenu();
    initProjectFilters();
    initContactForm();
    initAnimations();
    initBackToTop();
    initEmailFeature();
    
    // EmailJS初始化（替换为你的公钥）
    emailjs.init('bu9KzKbiZezJcbpeX');
});

// 主题切换功能
function initTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    const themeIcon = themeToggle.querySelector('i');
    themeToggle.removeAttribute('title');

    const isDarkMode = document.body.classList.contains('dark-mode');
    updateThemeUI(isDarkMode, themeToggle, themeIcon);

    themeToggle.addEventListener('click', () => {
        const isNowDark = !document.body.classList.toggle('dark-mode');
        document.documentElement.classList.toggle('dark-mode', isNowDark);
        localStorage.setItem('darkMode', isNowDark.toString());
        updateThemeUI(isNowDark, themeToggle, themeIcon);
    });
}

function updateThemeUI(isDark, toggle, icon) {
    if (isDark) {
        icon?.classList.replace('fa-sun', 'fa-moon');
        toggle?.setAttribute('data-tooltip', '切换为浅色模式');
    } else {
        icon?.classList.replace('fa-moon', 'fa-sun');
        toggle?.setAttribute('data-tooltip', '切换为深色模式');
    }
}

// 移动端菜单
function initMobileMenu() {
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('show');
        document.querySelectorAll('.bar').forEach(bar => bar.classList.toggle('active'));
    });

    document.querySelectorAll('.nav-links a').forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('show');
            document.querySelectorAll('.bar').forEach(bar => bar.classList.remove('active'));
        });
    });
}

// 项目过滤
function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projects = document.querySelectorAll('.card[data-category]');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            projects.forEach(project => {
                project.style.display = 
                    (filter === 'all' || project.dataset.category === filter) ? 'block' : 'none';
            });
        });
    });
}

// 联系表单（带24小时限制）
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const STORAGE_KEY = 'form_submissions';
    const MAX_SUBMISSIONS = 3;
    const COOLDOWN_HOURS = 24;

    function checkLimit() {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { count: 0, firstTime: null };
        if (data.firstTime && (Date.now() - data.firstTime) > COOLDOWN_HOURS * 3600000) {
            localStorage.removeItem(STORAGE_KEY);
            return true;
        }
        return data.count < MAX_SUBMISSIONS;
    }

    function recordSubmission() {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { count: 0, firstTime: null };
        if (!data.firstTime) data.firstTime = Date.now();
        data.count++;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!checkLimit()) {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
            const hoursLeft = COOLDOWN_HOURS - Math.floor((Date.now() - data.firstTime) / 3600000);
            alert(`太频繁啦！请${hoursLeft}小时后再试\n或直接联系：dayuncloud@qq.com`);
            return;
        }

        const originalText = submitBtn.textContent;
        submitBtn.textContent = '发送中...';
        submitBtn.disabled = true;

        try {
            await emailjs.sendForm('service_0b5rod8', 'template_uofl1lf', contactForm);
            recordSubmission();
            alert('发送成功！我会尽快回复您。');
            contactForm.reset();
        } catch (error) {
            console.error('发送失败:', error);
            alert(`发送失败，请直接联系：dayuncloud@qq.com`);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// 动画初始化（使用Intersection Observer）
function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));
}

// 邮箱复制功能
function initEmailFeature() {
    const emailTooltip = document.querySelector('.email-tooltip');
    const copyBtn = document.querySelector('.copy-btn');
    if (!emailTooltip || !copyBtn) return;

    // 点击邮箱图标显示/隐藏提示框
    document.querySelectorAll('.email-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            emailTooltip.classList.toggle('show');
            
            const closeTooltip = (e) => {
                if (!emailTooltip.contains(e.target) && !icon.contains(e.target)) {
                    emailTooltip.classList.remove('show');
                    document.removeEventListener('click', closeTooltip);
                }
            };
            document.addEventListener('click', closeTooltip);
        });
    });

    // 复制功能（实时获取邮箱地址）
    copyBtn.addEventListener('click', () => {
        const email = document.querySelector('.email-address').textContent;
        navigator.clipboard.writeText(email).then(() => {
            copyBtn.textContent = '已复制';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.textContent = '复制';
                copyBtn.classList.remove('copied');
            }, 2000);
        }).catch(() => {
            alert('复制失败，请手动选择文本复制');
        });
    });
}

// 返回顶部按钮
function initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        const show = window.scrollY > window.innerHeight;
        btn.classList.toggle('show', show);
        btn.classList.toggle('fade', !show);
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

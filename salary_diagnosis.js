// UI Elements
const diagnoseButton = document.getElementById('diagnose-button');
const buttonText = document.getElementById('button-text');
const loadingSpinner = document.getElementById('loading-spinner');
const resultContainer = document.getElementById('result-container');
const reportContent = document.getElementById('report-content');

const ageSelect = document.getElementById('age-select');
const experienceSelect = document.getElementById('experience-select');
const industryInput = document.getElementById('industry-input');
const roleInput = document.getElementById('role-input');
const locationInput = document.getElementById('location-input');
const skillsCheckboxes = document.querySelectorAll('input[name="skills"]');
const otherSkillsText = document.getElementById('other-skills');
const workStyleCheckboxes = document.querySelectorAll('input[name="work_style"]');

// Helper function to collect checkbox values
const getCheckedValues = (name) => {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
                .map(cb => cb.value)
                .join(', ');
};

// Function to handle the button click
diagnoseButton.addEventListener('click', () => {
    // 1. Collect all data
    const age = ageSelect.value;
    const experience = experienceSelect.value;
    const industry = industryInput.value.trim().toLowerCase();
    const role = roleInput.value.trim();
    const location = locationInput.value.trim().toLowerCase();
    const skills = getCheckedValues('skills');
    const otherSkills = otherSkillsText.value.trim();
    const workStyle = getCheckedValues('work_style');

    // Basic validation
    if (!age || !experience || !industry || !role || !location) {
        reportContent.innerHTML = `<p class="text-center text-yellow-400">診断には、年齢、経験年数、業界、職種、勤務地の入力が必須です。</p>`;
        resultContainer.classList.remove('hidden');
        return;
    }

    // 3. UI State: Loading
    diagnoseButton.disabled = true;
    buttonText.textContent = '診断中...';
    loadingSpinner.classList.remove('hidden');
    resultContainer.classList.add('hidden');
    reportContent.innerHTML = '';

    // Simulate a short delay for better UX
    setTimeout(() => {
        // 2. Local Salary Calculation
        let baseSalary = 350; // Base salary in 万円
        let analysis = [];

        // Experience
        switch (experience) {
            case '0-3年 (初心者)': baseSalary += 0; analysis.push('若手のポテンシャル採用としての評価です。'); break;
            case '4-7年 (中堅)': baseSalary += 150; analysis.push('中堅として、実務経験が評価されています。'); break;
            case '8-15年 (ベテラン)': baseSalary += 300; analysis.push('豊富な経験を持つベテランとして高く評価されています。'); break;
            case '16年以上 (エキスパート)': baseSalary += 450; analysis.push('エキスパートとして、業界トップクラスの評価です。'); break;
        }

        // Age
        if (age.includes('30代')) { baseSalary += 50; }
        if (age.includes('40代')) { baseSalary += 100; }
        if (age.includes('50代')) { baseSalary += 120; }

        // Location
        if (location.includes('東京')) { baseSalary += 100; analysis.push('勤務地（東京）は給与水準が高い傾向にあります。'); }
        else if (location.includes('大阪')) { baseSalary += 50; analysis.push('勤務地（大阪）は給与水準が比較的高めです。'); }
        else if (location.includes('リモート')) { baseSalary += 20; analysis.push('リモートワークは柔軟な働き方として評価されます。');}

        // Industry
        if (['it', 'ソフトウェア', '金融', 'コンサル'].some(v => industry.includes(v))) {
            baseSalary += 100;
            analysis.push('専門性の高い業界（IT/金融/コンサル等）は高年収が期待できます。');
        }

        // Skills
        let skillBonus = 0;
        if (skills.includes('プロジェクト管理能力')) skillBonus += 80;
        if (skills.includes('英語力/ビジネスレベルの語学力')) skillBonus += 70;
        if (skills.includes('特定技術の専門知識')) skillBonus += 120;
        if (skills.includes('チーム育成/リーダーシップ経験')) skillBonus += 100;
        if (skills.includes('高いコミュニケーション/交渉力')) skillBonus += 60;
        if (skillBonus > 0) {
            baseSalary += skillBonus;
            analysis.push('保有スキルが市場価値を大きく高めています。');
        }

        const lowerBound = Math.floor(baseSalary * 0.9);
        const upperBound = Math.ceil(baseSalary * 1.1);

        // 4. Generate and Display the report
        const report = `
1. 適正年収の範囲 (万円): ${lowerBound}万円〜${upperBound}万円

2. 診断の根拠と分析:
${analysis.join('\n')}
これは簡易的な診断であり、あなたの経歴とスキルの組み合わせから推定される市場価値です。

3. 年収アップのための具体的なヒント:
- 今回選択したスキルや、今後習得したいスキルの専門性をさらに高めましょう。
- 自身の成果を定量的に示せるように、職務経歴書を定期的に更新しましょう。
- 転職エージェントに相談し、客観的な市場価値の評価を受けてみるのも有効です。
        `;

        const formattedText = report
            .replace(/1\. 適正年収の範囲 \(万円\):/g, '<div class="report-section"><h3 class="text-xl font-bold text-yellow-400 mb-2">1. 適正年収の範囲 (万円)</h3><p class="text-3xl font-extrabold text-[#4c8cff] mb-4">')
            .replace(/2\. 診断の根拠と分析:/g, '</p></div><div class="report-section"><h3 class="text-xl font-bold text-white mb-2">2. 診断の根拠と分析</h3><p>')
            .replace(/3\. 年収アップのための具体的なヒント:/g, '</p></div><div class="report-section"><h3 class="text-xl font-bold text-white mb-2">3. 年収アップのための具体的なヒント</h3><p>')
            .replace(/\n/g, '<br>') + '</p></div>';

        reportContent.innerHTML = formattedText;
        resultContainer.classList.remove('hidden');

        // 5. UI State: Reset
        diagnoseButton.disabled = false;
        buttonText.textContent = '再度診断する';
        loadingSpinner.classList.add('hidden');

    }, 1000); // 1 second delay
});
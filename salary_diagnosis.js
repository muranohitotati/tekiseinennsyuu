        // Gemini API configuration
        const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=';
        const apiKey = ""; // Canvas will provide this in runtime

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

        // Function to handle the button click and AI call
        diagnoseButton.addEventListener('click', async () => {
            
            // 1. Collect all data
            const age = ageSelect.value;
            const experience = experienceSelect.value;
            const industry = industryInput.value.trim();
            const role = roleInput.value.trim();
            const location = locationInput.value.trim();
            const skills = getCheckedValues('skills');
            const otherSkills = otherSkillsText.value.trim();
            const workStyle = getCheckedValues('work_style');

            // 2. Formulate the comprehensive prompt
            let inputData = [];
            if (age) inputData.push(`年齢層: ${age}`);
            if (experience) inputData.push(`職務経験年数: ${experience}`);
            if (industry) inputData.push(`現在の業界: ${industry}`);
            if (role) inputData.push(`現在の職種/役割: ${role}`);
            if (location) inputData.push(`勤務地: ${location}`);
            if (skills || otherSkills) {
                const allSkills = [skills, otherSkills].filter(s => s).join(', ');
                inputData.push(`保有スキル/強み: ${allSkills}`);
            }
            if (workStyle) inputData.push(`希望の働き方: ${workStyle}`);

            const userQuery = inputData.join(' | ');

            if (userQuery.length < 50) {
                reportContent.innerHTML = `<p class="text-center text-yellow-400">診断には、最低限「業界」「職種」「経験年数」などの詳細な情報が必要です。</p>`;
                resultContainer.classList.remove('hidden');
                return;
            }

            // 3. UI State: Loading
            diagnoseButton.disabled = true;
            buttonText.textContent = '診断中...';
            loadingSpinner.classList.remove('hidden');
            resultContainer.classList.add('hidden');
            reportContent.innerHTML = '';

            const systemPrompt = `
                あなたは市場価値の専門家であり、キャリアコンサルタントです。
                ユーザーの入力データ（年齢層、経験、業界、スキル、ロケーション、希望の働き方）を分析し、**適正年収**を診断してください。
                
                出力は以下の3つのセクションからなる、詳細でプロフェッショナルなレポート形式で日本語で記述してください。

                1.  **適正年収の範囲 (万円):** [具体的な年収の範囲 (例: 650万円〜800万円)] - ユーザーのデータを総合的に判断した市場価値。
                2.  **診断の根拠と分析:** [各要素（経験、スキル、ロケーションなど）が年収にどう影響しているかの具体的な分析]
                3.  **年収アップのための具体的なヒント:** [現状から年収をさらに高めるための行動計画や推奨されるスキル]

                レポートの各セクションは改行で区切り、見出しを強調して表示してください。
            `;

            try {
                const response = await fetch(API_URL + apiKey, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: userQuery }] }],
                        systemInstruction: { parts: [{ text: systemPrompt }] }
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
                
                if (text) {
                    // 4. Process and Display the report
                    const formattedText = text
                        .replace(/1\. 適正年収の範囲 \(万円\):/g, '<div class="report-section"><h3 class="text-xl font-bold text-yellow-400 mb-2">1. 適正年収の範囲 (万円)</h3><p class="text-3xl font-extrabold text-[#4c8cff] mb-4">')
                        .replace(/2\. 診断の根拠と分析:/g, '</p></div><div class="report-section"><h3 class="text-xl font-bold text-white mb-2">2. 診断の根拠と分析</h3><p>')
                        .replace(/3\. 年収アップのための具体的なヒント:/g, '</p></div><div class="report-section"><h3 class="text-xl font-bold text-white mb-2">3. 年収アップのための具体的なヒント</h3><p>')
                        .replace(/\n/g, '<br>') + '</p></div>';
                        
                    reportContent.innerHTML = formattedText;
                    resultContainer.classList.remove('hidden');
                } else {
                    reportContent.innerHTML = `<p class="text-center text-red-400">診断レポートの生成に失敗しました。</p>`;
                    resultContainer.classList.remove('hidden');
                }

            } catch (error) {
                console.error('API call failed:', error);
                reportContent.innerHTML = `<p class="text-center text-red-400">通信エラーが発生しました。時間を置いて再度お試しください。</p>`;
                resultContainer.classList.remove('hidden');
            } finally {
                // 5. UI State: Reset
                diagnoseButton.disabled = false;
                buttonText.textContent = '年収を診断する';
                loadingSpinner.classList.add('hidden');
            }
        });
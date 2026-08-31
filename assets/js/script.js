document.addEventListener('DOMContentLoaded', () => {
    const packageInputs = document.querySelectorAll('input[name="package"]');
    const soloSection = document.getElementById('soloSection');
    const duoSection = document.getElementById('duoSection');
    const soloName = document.getElementById('soloName');
    const player1Name = document.getElementById('player1Name');
    const player2Name = document.getElementById('player2Name');
    const form = document.getElementById('registrationForm');
    const statusBox = document.getElementById('formStatus');

    const supabaseUrl = 'https://auqalrhjopvpzpdnmcse.supabase.co';
    const supabaseKey = 'sb_publishable_P50lr03jofL2zGA7Z844DA_Y0Rq79MS';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    function showStatus(message, type) {
        statusBox.textContent = message;
        statusBox.className = `form-status ${type}`;
    }

    function handlePackageChange(selectedPackage) {
        const isSolo = selectedPackage === 'solo';

        soloSection.classList.toggle('active', isSolo);
        duoSection.classList.toggle('active', !isSolo);

        soloName.required = isSolo;
        player1Name.required = !isSolo;
        player2Name.required = !isSolo;

        if (isSolo) {
            player1Name.value = '';
            player2Name.value = '';
        } else {
            soloName.value = '';
        }
    }

    packageInputs.forEach((input) => {
        input.addEventListener('change', () => {
            handlePackageChange(input.value);
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!form.reportValidity()) {
            return;
        }

        const formData = new FormData(form);
        const selectedPackage = formData.get('package');

        const payload = {
            contact_number: formData.get('contact_number'),
            email: formData.get('email'),
            preferred_day: formData.get('preferred_day'),
            preferred_time_slot: formData.get('preferred_time_slot'),
            package_type: selectedPackage,
            solo_name: selectedPackage === 'solo' ? formData.get('solo_name') : null,
            player_1_name: selectedPackage === 'duo' ? formData.get('player_1_name') : null,
            player_2_name: selectedPackage === 'duo' ? formData.get('player_2_name') : null,
            payment_method: formData.get('payment_method'),
            created_at: new Date().toISOString()
        };

        try {
            const { error: insertError } = await supabase.from('registrations').insert([payload]);

            if (insertError) {
                throw insertError;
            }

            try {
                const emailFunctionUrl = `${supabaseUrl}/functions/v1/send-registration-email`;
                const emailResponse = await fetch(emailFunctionUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${supabaseKey}`,
                    },
                    body: JSON.stringify(payload),
                });

                const emailResult = await emailResponse.json();

                if (!emailResponse.ok) {
                    console.error('Email send failed:', emailResult);
                }
            } catch (emailError) {
                console.error('Email send request failed:', emailError);
            }

            showStatus('Registration saved successfully! A confirmation email will be sent shortly.', 'success');
            form.reset();
            soloSection.classList.remove('active');
            duoSection.classList.remove('active');
        } catch (error) {
            console.error('Supabase insert error:', error);
            showStatus('Something went wrong while saving the registration. Please try again.', 'error');
        }
    });
});

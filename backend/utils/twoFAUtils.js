import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

class TwoFAUtils {
	/**
	 * Genera un nuevo secreto para TOTP
	 */
	generateSecret(username) {
		const secret = speakeasy.generateSecret({
			name: `ft_transcendence (${username})`,
			length: 32
		});

		return {
			secret: secret.base32,
			otpauth_url: secret.otpauth_url
		};
	}

	/**
	 * Genera un código QR para escanear con Google Authenticator
	 */
	async generateQRCode(otpauth_url) {
		try {
			const qrCodeDataURL = await QRCode.toDataURL(otpauth_url);
			return qrCodeDataURL;
		} catch (error) {
			throw new Error('Error generando código QR: ' + error.message);
		}
	}

	/**
	 * Verifica un código TOTP
	 */
	verifyToken(secret, token) {
		return speakeasy.totp.verify({
			secret: secret,
			encoding: 'base32',
			token: token,
			window: 2 // Acepta tokens con +/- 60 segundos de diferencia
		});
	}

	/**
	 * Genera un código TOTP (útil para pruebas)
	 */
	generateToken(secret) {
		return speakeasy.totp({
			secret: secret,
			encoding: 'base32'
		});
	}
}

export default new TwoFAUtils();

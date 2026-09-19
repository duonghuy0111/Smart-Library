package com.dt3.configs;

import java.nio.charset.StandardCharsets;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class VNPayConfig {

    public static String vnp_TmnCode;
    public static String vnp_HashSecret;
    public static String vnp_Url;
    public static String vnp_ReturnUrl;

    @Value("${vnpay.tmn_code}")
    public void setVnp_TmnCode(String value) {
        VNPayConfig.vnp_TmnCode = value;
    }

    @Value("${vnpay.hash_secret}")
    public void setVnp_HashSecret(String value) {
        VNPayConfig.vnp_HashSecret = value;
    }

    @Value("${vnpay.url}")
    public void setVnp_Url(String value) {
        VNPayConfig.vnp_Url = value;
    }

    @Value("${vnpay.return_url}")
    public void setVnp_ReturnUrl(String value) {
        VNPayConfig.vnp_ReturnUrl = value;
    }

    public static String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }

            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey =
                    new SecretKeySpec(hmacKeyBytes, "HmacSHA512");

            hmac512.init(secretKey);

            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);

            StringBuilder sb = new StringBuilder(2 * result.length);

            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }

            return sb.toString();

        } catch (Exception ex) {
            return "";
        }
    }
}
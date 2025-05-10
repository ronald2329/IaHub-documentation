import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

public class GerarFoto {

    public static void gerarEBaixarImagem(String prompt) {
        try {
            long startTime = System.currentTimeMillis();
            String xApiKey = "SUA_API_KEY";

            System.out.println("Gerando imagem...");

            URL url = new URL("https://api.iahub.site/generate-image");
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("POST");

            con.setRequestProperty("Content-Type", "application/json");
            con.setRequestProperty("Accept-Encoding", "gzip, deflate");
            con.setRequestProperty("x-api-key",xApiKey);
            con.setDoOutput(true);

            String jsonInputString = String.format("{\"prompt\": \"%s\"}", prompt);

            try (OutputStream os = con.getOutputStream()) {
                byte[] input = jsonInputString.getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            int code = con.getResponseCode();
            if (code != HttpURLConnection.HTTP_OK) {
                System.err.println("Erro ao gerar imagem: " + new BufferedReader(
                        new InputStreamReader(con.getErrorStream()))
                        .readLine());
                return;
            }

            try (InputStream in = con.getInputStream();
                 FileOutputStream out = new FileOutputStream("gerando-imagem-local.png")) {
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                }
            }

            long elapsed = System.currentTimeMillis() - startTime;
            System.out.println("✅ Imagem salva como: gerando-imagem-local.png");
            System.out.println("Gerando imagem... " + (elapsed / 1000.0) + " segundos");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        gerarEBaixarImagem("A flying shark with mechanical wings, blue sky background, digital art");
    }
}

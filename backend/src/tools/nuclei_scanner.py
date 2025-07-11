import json
import subprocess

from src.tools.base import BaseTool
from src.exceptions import NucleiScannerError


class NucleiScannerTool(BaseTool):
    """
    A tool for running Nuclei scans to find vulnerabilities.
    """

    def run(self, url: str) -> str:
        """
        Runs a Nuclei scan against a specified URL.

        Args:
            url: The target URL to be scanned.

        Returns:
            A JSON string summarizing the scan results.
        """
        output_file = "nuclei_output.json"
        command = [
            "nuclei",
            "-u",
            url,
            "-t",
            "sqli/",
            "-json-export",
            output_file,
            "-silent",
            "-nc",
        ]

        try:
            subprocess.run(command, check=True, capture_output=True, text=True)

            with open(output_file, "r") as f:
                results = [json.loads(line) for line in f]

            if not results:
                return json.dumps({"message": "No vulnerabilities found."})

            summary = []
            for res in results:
                summary.append(
                    {
                        "templateID": res.get("template-id"),
                        "vulnerability": res.get("info", {}).get("name"),
                        "severity": res.get("info", {}).get("severity"),
                        "host": res.get("host"),
                        "matched_at": res.get("matched-at"),
                        "curl_command": res.get("curl-command"),
                    }
                )

            return json.dumps(summary, indent=2)

        except FileNotFoundError:
            raise NucleiScannerError("Nuclei is not installed or not in PATH.")
        except subprocess.CalledProcessError as e:
            raise NucleiScannerError(f"Nuclei scan failed: {e.stderr}")
        except Exception as e:
            raise NucleiScannerError(f"An unexpected error occurred: {str(e)}")
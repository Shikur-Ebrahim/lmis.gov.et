import { useEffect } from "react"
import { Check, AlertCircle, Info, X } from "lucide-react"

export default function Toast({ message, type = "info", onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose()
        }, 5000)

        return () => clearTimeout(timer)
    }, [onClose])

    const icons = {
        success: <Check className="w-5 h-5 text-white" />,
        error: <AlertCircle className="w-5 h-5 text-white" />,
        info: <Info className="w-5 h-5 text-white" />,
    }

    const styles = {
        success: "bg-green-500",
        error: "bg-red-500",
        info: "bg-blue-500",
    }

    return (
        <div className={`fixed bottom-4 right-4 z-[9999] flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg transform transition-all duration-300 animate-slide-in ${styles[type]} text-white min-w-[300px]`}>
            <div className="flex-shrink-0 bg-white/20 rounded-full p-1">
                {icons[type]}
            </div>
            <p className="flex-1 font-medium text-sm">{message}</p>
            <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, MapPin, Clock, Heart, AlertTriangle, Stethoscope, MessageCircle, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SupportPage() {
  const emergencyHelplines = [
    {
      name: "National Suicide Prevention Lifeline",
      number: "988",
      description: "24/7 crisis support",
      type: "Emergency",
    },
    {
      name: "Crisis Text Line",
      number: "Text HOME to 741741",
      description: "24/7 text-based crisis support",
      type: "Emergency",
    },
    {
      name: "SAMHSA National Helpline",
      number: "1-800-662-4357",
      description: "Mental health and substance abuse support",
      type: "Support",
    },
    {
      name: "National Alliance on Mental Illness",
      number: "1-800-950-6264",
      description: "Information and support",
      type: "Information",
    },
  ]

  const nearbyDoctors = [
    {
      name: "Dr. Sarah Johnson",
      specialty: "Clinical Psychologist",
      phone: "(555) 123-4567",
      address: "123 Wellness Ave, Downtown",
      availability: "Mon-Fri 9AM-6PM",
      rating: "4.9",
    },
    {
      name: "Dr. Michael Chen",
      specialty: "Psychiatrist",
      phone: "(555) 234-5678",
      address: "456 Mental Health Blvd, Midtown",
      availability: "Mon-Thu 8AM-5PM",
      rating: "4.8",
    },
    {
      name: "Dr. Emily Rodriguez",
      specialty: "Therapist (LCSW)",
      phone: "(555) 345-6789",
      address: "789 Therapy Lane, Uptown",
      availability: "Tue-Sat 10AM-7PM",
      rating: "4.9",
    },
    {
      name: "Dr. David Kim",
      specialty: "Stress Management Specialist",
      phone: "(555) 456-7890",
      address: "321 Calm Street, Westside",
      availability: "Mon-Wed-Fri 9AM-4PM",
      rating: "4.7",
    },
  ]

  const supportCategories = [
    {
      title: "Immediate Crisis Support",
      icon: AlertTriangle,
      color: "from-secondary-500 to-secondary-400",
      description: "If you're in immediate danger or having thoughts of self-harm",
    },
    {
      title: "Professional Counseling",
      icon: Stethoscope,
      color: "from-primary-600 to-primary-500",
      description: "Connect with licensed mental health professionals",
    },
    {
      title: "Peer Support",
      icon: MessageCircle,
      color: "from-primary-700 to-primary-600",
      description: "Talk to others who understand your experience",
    },
    {
      title: "General Information",
      icon: Mail,
      color: "from-secondary-400 to-accent-50",
      description: "Learn more about mental health resources and support",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-800/20 bg-black/60 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-gray-200 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MindTune Support</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">We're Here to Help</h1>
            <p className="text-xl text-gray-600 mb-8">
              Access immediate support, connect with professionals, and find the help you need. You're not alone in this
              journey.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center space-x-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Emergency? Call 911 or go to your nearest emergency room</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Types of Support Available</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportCategories.map((category, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <category.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Helplines */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Emergency Helplines</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {emergencyHelplines.map((helpline, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CardTitle className="text-lg">{helpline.name}</CardTitle>
                          <Badge
                            variant={
                              helpline.type === "Emergency"
                                ? "destructive"
                                : helpline.type === "Support"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {helpline.type}
                          </Badge>
                        </div>
                        <CardDescription className="mb-4">{helpline.description}</CardDescription>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-5 h-5 text-primary-600" />
                          <span className="text-2xl font-bold text-primary-600">{helpline.number}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-primary-600 hover:bg-primary-700">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nearby Doctors */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Nearby Mental Health Professionals</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {nearbyDoctors.map((doctor, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-gray-900 mb-1">{doctor.name}</CardTitle>
                        <p className="text-emerald-600 font-medium mb-2">{doctor.specialty}</p>
                        <div className="flex items-center space-x-1 mb-3">
                          <div className="flex text-yellow-400">
                            {"★".repeat(Math.floor(Number.parseFloat(doctor.rating)))}
                          </div>
                          <span className="text-sm text-gray-600">({doctor.rating})</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="font-semibold text-lg">{doctor.phone}</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <span className="text-gray-600">{doctor.address}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{doctor.availability}</span>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button className="flex-1 bg-primary-600 hover:bg-primary-700">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-primary-200 text-primary-700 hover:bg-primary-50"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Directions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Additional Resources</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Online Therapy Platforms</CardTitle>
                  <CardDescription>Connect with licensed therapists online</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Support Groups</CardTitle>
                  <CardDescription>Find local and online support communities</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Find Groups
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Mental Health Apps</CardTitle>
                  <CardDescription>Recommended apps for daily mental wellness</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    View Apps
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Need More Help?</h2>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Contact Our Support Team</CardTitle>
                <CardDescription>We'll get back to you within 24 hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="How can we help you?"
                  />
                </div>
                <Button className="w-full bg-primary-600 hover:bg-primary-700">Send Message</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

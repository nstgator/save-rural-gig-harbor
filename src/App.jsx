import React, { useState, useEffect } from 'react'
import { Clock, Users, TreePine, Home, AlertTriangle, CheckCircle, Share2, Download } from 'lucide-react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Textarea } from './components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Checkbox } from './components/ui/checkbox'
import { Badge } from './components/ui/badge'
import './App.css'

// Import images
import buildingImage from './assets/bw.jpg'
import floorPlanImage from './assets/Image_2.jpg'
import barnImage from './assets/Image_3.jpg'
import sitePlanImage from './assets/siteplan.jpg'

function App() {
  const [signatures, setSignatures] = useState(0)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    phone: '',
    isResident: false,
    comments: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [signatureData, setSignatureData] = useState([])

  const [selectedImage, setSelectedImage] = useState(null)

  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
  }

  // Add keyboard shortcut for admin access
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setShowAdmin(!showAdmin)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showAdmin])
  useEffect(() => {
    const savedSignatures = localStorage.getItem('petitionSignatures')
    if (savedSignatures) {
      const data = JSON.parse(savedSignatures)
      setSignatureData(data)
      setSignatures(data.length + 12) // Initialize with saved signatures + 12
    } else {
      setSignatures(12) // Start at 12 if no saved signatures
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    // Map Netlify form names to state properties
    const nameMap = {
      'full-name': 'fullName',
      'email': 'email',
      'address': 'address',
      'phone': 'phone',
      'gig-harbor-resident': 'isResident',
      'comments': 'comments'
    }
    
    const stateKey = nameMap[name] || name
    
    setFormData(prev => ({
      ...prev,
      [stateKey]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.fullName || !formData.email || !formData.address) {
      alert('Please fill in all required fields.')
      return
    }

    setIsSubmitting(true)
    
    // Update signature counter immediately for user feedback
    const newSignature = {
      ...formData,
      timestamp: new Date().toISOString(),
      id: Date.now()
    }
    
    const updatedSignatures = [...signatureData, newSignature]
    setSignatureData(updatedSignatures)
    setSignatures(prevSignatures => prevSignatures + 1)
    
    // Save to localStorage
    localStorage.setItem('petitionSignatures', JSON.stringify(updatedSignatures))
    
    // Create form data for Netlify
    const netlifyFormData = new FormData()
    netlifyFormData.append('form-name', 'petition-signature')
    netlifyFormData.append('full-name', formData.fullName)
    netlifyFormData.append('email', formData.email)
    netlifyFormData.append('address', formData.address)
    netlifyFormData.append('phone', formData.phone)
    netlifyFormData.append('gig-harbor-resident', formData.isResident ? 'Yes' : 'No')
    netlifyFormData.append('comments', formData.comments)
    netlifyFormData.append('timestamp', new Date().toISOString())
    
    try {
      // Submit to Netlify
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(netlifyFormData).toString()
      })
    } catch (error) {
      console.log('Netlify form submission error:', error)
      // Continue anyway - local storage still works
    }
    
    // Reset form
    setFormData({
      fullName: '',
      email: '',
      address: '',
      phone: '',
      isResident: false,
      comments: ''
    })
    
    setIsSubmitting(false)
    alert('Thank you for signing the petition! Your signature has been recorded.')
  }

  const downloadCSV = () => {
    const headers = ['Full Name', 'Email', 'Address', 'Phone', 'Gig Harbor Resident', 'Comments', 'Timestamp']
    const csvContent = [
      headers.join(','),
      ...signatureData.map(sig => [
        `"${sig.fullName}"`,
        `"${sig.email}"`,
        `"${sig.address}"`,
        `"${sig.phone || ''}"`,
        sig.isResident ? 'Yes' : 'No',
        `"${sig.comments.replace(/"/g, '""')}"`,
        `"${new Date(sig.timestamp).toLocaleString()}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `petition-signatures-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const shareMessage = "Help Save Rural Gig Harbor from destructive development! Sign the petition to stop Kensington Gardens and protect our community."

  return (
    <div className="min-h-screen bg-background smooth-scroll">
      {/* Urgent Banner */}
        <div className="urgent-banner text-white py-3 px-4 text-center font-semibold">
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-5 w-5" />
            <span>⏰ Public Hearing August 11th - Submit comments by August 10th!</span>
          </div>
        </div>

      {/* Header */}
      <header className="hero-gradient text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TreePine className="h-12 w-12" />
            <h1 className="text-4xl md:text-6xl font-bold">Save Rural Gig Harbor</h1>
          </div>
          <p className="text-xl md:text-2xl mb-6 opacity-90">
            Stop Kensington Gardens - Protect Our Community from Destructive Development
          </p>
          
          {/* Signature Counter */}
          <div className="signature-counter inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg mb-8">
            <Users className="h-6 w-6" />
            <span>{signatures.toLocaleString()} Signatures</span>
          </div>

          {/* Social Share Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => {
                const url = encodeURIComponent(window.location.href)
                const text = encodeURIComponent(shareMessage)
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, 
                            '_blank', 
                            'width=600,height=400')
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share on Facebook
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => {
                const url = encodeURIComponent(window.location.href)
                const text = encodeURIComponent(shareMessage)
                window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, 
                            '_blank', 
                            'width=600,height=400')
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share on X (Twitter)
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(`${shareMessage} ${window.location.href}`)
                alert("Link copied to clipboard!")
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </div>
      </header>

      {/* Admin Dashboard */}
      {showAdmin && (
        <div className="bg-muted py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Admin Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{signatures} Total Signatures</p>
                  <p className="text-muted-foreground">
                    {signatureData.filter(sig => sig.isResident).length} Gig Harbor residents (of {signatureData.length} form submissions)
                  </p>
                </div>
                  <Button onClick={downloadCSV} disabled={signatures === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* New Intro Section */}
        <section className="mb-16 fade-in-up">
          <Card className="nature-card forest-shadow hover-lift">
            <CardContent className="p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
                What's Being Proposed: The Truth Behind the Replat
              </h2>
              <p className="text-lg leading-relaxed mb-6">
                Kensington Gardens Resort Living Community is requesting to divide their property into sub-parcels for what they claim will be 'single-family homes.' We support more housing - our communities genuinely need it. But this isn't about homes for families. This is a master-planned luxury retirement community, which is commercial development prohibited in rural zones. They're using the replat process to circumvent zoning laws by disguising commercial facilities as residential homes.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Hero Section */}
        <section className="mb-16 fade-in-up">
          <Card className="nature-card forest-shadow hover-lift">
            <CardContent className="p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
                If they win here, nowhere is safe.
              </h2>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-lg leading-relaxed mb-6">
                    If Kensington Gardens gets away with building four more massive commercial buildings 
                    disguised as 'single-family homes,' it will set a precedent for apartment complexes, 
                    multi-family residential structures, and other incompatible developments throughout 
                    our protected rural areas. Lack of enforcement raises serious questions: if regulations 
                    aren't upheld here, what other non-compliant projects might slip through? Our rural 
                    character is what makes Gig Harbor distinctive—once we lose these protections, we can't get them back.
                  </p>
                </div>
                <div className="space-y-4">
                  <img 
                    src={sitePlanImage} 
                    alt="Kensington Gardens site plan showing multiple villas and commercial facilities" 
                    className="w-full rounded-lg shadow-lg cursor-pointer"
                    onClick={() => handleImageClick(sitePlanImage)}
                  />
                  <p className="text-sm text-muted-foreground italic">
                    <strong>Their Master Plan:</strong> Multiple "villas" and commercial facilities disguised 
                    as single-family homes - this is clearly a commercial resort development, not residential housing
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* What's Really Happening Section */}
        <section className="mb-16 fade-in-up">
          <h2 className="text-3xl font-bold mb-8 text-primary">What's Really Happening</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="nature-card">
              <CardContent className="p-6">
                <p className="text-lg leading-relaxed">
                  Kensington Gardens has already built one 30,000 square foot commercial retirement 
                  facility and now wants to build four more buildings on a very similar scale - all 
                  while claiming they're 'single-family homes.' If Pierce County approves this deception, 
                  every rural area in Gig Harbor becomes a target for similar development.
                </p>
              </CardContent>
            </Card>
            <div className="space-y-4">
              <img 
                src={buildingImage} 
                alt="Kensington Gardens building facade" 
                className="w-full rounded-lg shadow-lg cursor-pointer"
                onClick={() => handleImageClick(buildingImage)}
              />
              <p className="text-sm text-muted-foreground italic">
                <strong>The Reality:</strong> This is what Kensington Gardens calls a 'single-family home' - 
                a 30,000 sq ft commercial retirement facility with multiple units
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <img 
                src={floorPlanImage} 
                alt="Floor plan showing multiple units" 
                className="w-full rounded-lg shadow-lg cursor-pointer"
                onClick={() => handleImageClick(floorPlanImage)}
              />
              <p className="text-sm text-muted-foreground italic">
                <strong>Just ONE Floor of Their 'Single-Family Home':</strong> Six separate luxury suites 
                with individual entrances, kitchens, and living areas on a single level - this is clearly 
                a multi-unit commercial facility, not a single-family residence
              </p>
            </div>
            <Card className="nature-card">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 text-primary">
                  If they succeed here, we can expect:
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span>Apartment buildings claiming to be 'single-family homes' throughout R5 zones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span>Developers of multi-family residential structures destroying remaining rural areas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span>Commercial operations disguised as houses</span></li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span>The erosion of protections that preserve our community character</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* What We're Losing Section */}
        <section className="mb-16 fade-in-up">
          <h2 className="text-3xl font-bold mb-8 text-primary">What We're Losing</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <img 
                src={barnImage} 
                alt="Historic homestead and natural landscape" 
                className="w-full rounded-lg shadow-lg cursor-pointer"
                onClick={() => handleImageClick(barnImage)}
              />
              <p className="text-sm text-muted-foreground italic">
                <strong>What Was Lost:</strong> The historic homestead and natural landscape that was cleared 
                for this commercial development - once it's gone, we can't get it back
              </p>
            </div>
            <Card className="nature-card">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Home className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Our Rural Character</h4>
                      <p className="text-sm text-muted-foreground">
                        The farming heritage, and pastoral character that make 
                        Gig Harbor special and are protected by the Pierce County Comprehensive Plan
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TreePine className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Natural Beauty</h4>
                      <p className="text-sm text-muted-foreground">
                        Dense forests, wetlands, wildlife habitat for critically endangered species
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Community Safety</h4>
                      <p className="text-sm text-muted-foreground">
                        Narrow rural roads weren't designed for high-density traffic and emergency vehicles
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Groundwater Protection</h4>
                      <p className="text-sm text-muted-foreground">
                        All neighbors are on wells - sewage from high density housing threatens our drinking water</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* What Residents Are Saying */}
        <section className="mb-16 fade-in-up">
          <h2 className="text-3xl font-bold mb-8 text-primary">What Residents Are Saying</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="nature-card hover-lift">
              <CardContent className="p-6">
                <p className="italic mb-4">
                  "My heart breaks seeing forest after forest completely clear cut."
                </p>
                <p className="font-semibold text-primary">- Linda Healy</p>
              </CardContent>
            </Card>
            <Card className="nature-card hover-lift">
              <CardContent className="p-6">
                <p className="italic mb-4">
                  "What good are community plans if all you need is enough money and time and no plans or rules apply?"
                </p>
                <p className="font-semibold text-primary">- Greg Thon</p>
              </CardContent>
            </Card>
            <Card className="nature-card hover-lift">
              <CardContent className="p-6">
                <p className="italic mb-4">
                  "We need to protect our rural areas and wildlife"
                </p>
                <p className="font-semibold text-primary">- Ruth Johnson</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* What's At Stake Comparison */}
        <section className="mb-16 fade-in-up">
          <h2 className="text-3xl font-bold mb-8 text-primary">What's At Stake</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="what-at-stake-danger p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-destructive flex items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                IF THIS IS APPROVED:
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Establishes a precedent that could lead to:</li>
                <li>• Vulnerable communities housed in inappropriate areas</li>
                <li>• Multi-family residential developments eliminating remaining rural areas</li>
                <li>• Commercial operations disguised as homes</li>
                <li>• End of rural zoning protections</li>
                <li>• Traffic, noise, and overdevelopment everywhere</li>
                <li>• Loss of wildlife habitat and natural beauty</li>
                <li>• Sewage from high density housing contaminating groundwater</li>
                <li>• Gig Harbor becomes another overdeveloped suburb</li>
              </ul>
            </div>
            <div className="what-at-stake-hope p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
                <CheckCircle className="h-6 w-6" />
                🌲 IF WE STOP IT:
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• New housing is concentrated in areas that can provided needed services</li>
                <li>• Wildlife habitat protected</li>
                <li>• Rural character preserved</li>
                <li>• Groundwater stays clean</li>
                <li>• Future generations can enjoy what we love about Gig Harbor</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Petition Text */}
        <section className="mb-16 fade-in-up">
          <Card className="nature-card forest-shadow">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-primary">
                The Petition
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Read what you're signing - this petition will be submitted to Pierce County Planning Office
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                <p className="font-semibold mb-4">
                  We, the undersigned, demand Pierce County REJECT the Kensington Gardens Resort Living Community sub-plat and protect our cherished rural and wild areas.
                </p>
                
                <p className="mb-4">
                  This is about more than one development - it's about setting a precedent that will destroy the remaining rural areas in our community.
                </p>

                <div className="mb-6">
                  <h4 className="font-bold text-primary mb-2">WHAT THEY'VE DONE:</h4>
                  <p className="mb-4">
                    Kensington Gardens has already built one 30,000 square foot commercial retirement facility with multiple units. County records classify it as a 'commercial retirement home,' yet they continue claiming it's a 'single-family home.'
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold text-primary mb-2">WHAT THEY WANT:</h4>
                  <p className="mb-4">
                    Four more buildings on a very similar scale, creating a massive commercial resort with residents and dozens of staff members - all in an R5 rural zone where such facilities are PROHIBITED.
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold text-primary mb-2">WHY WE MUST STOP THIS:</h4>
                  <p className="mb-4">
                    If Pierce County rewards this deception, it signals that ANY developer can:
                  </p>
                  <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Build apartment complexes and claim they\'re single-family residences</li>
                    <li>Construct multi-family residential structures in rural zones by calling them \'single dwelling units\'</li>
                    <li>Destroy protected rural areas with impunity</li>
                    <li>Ignore zoning regulations designed to preserve our community character</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold text-primary mb-2">WE DEMAND ACTION ON:</h4>
                  <div className="space-y-3">
                    <div>
                      <strong>Environmental Protection:</strong> Stop the destruction of wetlands, streams, and dense forest habitat. This area provides critical wildlife habitat for endangered species.
                    </div>
                    <div>
                      <strong>Rural Character Preservation:</strong> Preserve the farming heritage and pastoral character that define Gig Harbor and are protected by the Pierce County Comprehensive Plan.
                    </div>
                    <div>
                      <strong>Groundwater Protection:</strong> All neighbors are on wells. Commercial waste from hundreds of people threatens our drinking water and must be stopped.
                    </div>
                    <div>
                      <strong>Infrastructure Reality:</strong> Our narrow roads, septic systems, and emergency services cannot handle massive commercial operations.
                    </div>
                    <div>
                      <strong>Zoning Enforcement:</strong> Commercial retirement facilities are prohibited in R5 zones for good reason. Enforce existing laws instead of rewarding violations.
                    </div>
                    <div>
                      <strong>Community Voice:</strong> Listen to the 100+ residents who have repeatedly opposed this inappropriate development.
                    </div>
                    <div>
                      <strong>Future Protection:</strong> Prevent the precedent that will destroy every remaining rural area in Pierce County.
                    </div>
                  </div>
                </div>

                <p className="mb-4">
                  We live in Gig Harbor for its natural beauty, rural character, and escape from urban density. Don't let developers destroy what makes our community special.
                </p>

                <p className="mb-4">
                  We recognize the importance of finding good housing options as we age, just like finding solutions for affordable housing. But there are safe and appropriate locations for these developments - places where residents can access the care and services they need affordably, without destroying rural communities or threatening groundwater.
                </p>

                <p className="font-semibold text-primary">
                  Pierce County must choose: Protect rural Gig Harbor or watch it disappear forever under commercial development.
                </p>

                <p className="font-bold text-lg text-center mt-6 text-primary">
                  REJECT Kensington Gardens expansion - SAVE Rural Gig Harbor.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Petition Form */}
        <section className="mb-16 fade-in-up">
          <Card className="petition-form forest-shadow">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-primary">
                Sign the Petition - Save Rural Gig Harbor
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Your voice matters. Comments will be forwarded directly to Tony Kantas at the Pierce County Planning Office.
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6" name="petition-signature" method="POST" data-netlify="true">
                <input type="hidden" name="form-name" value="petition-signature" />
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      name="full-name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address <span className="text-destructive">*</span>
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mailing Address <span className="text-destructive">*</span>
                  </label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number (optional)
                  </label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isResident"
                    name="gig-harbor-resident"
                    checked={formData.isResident}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isResident: checked }))
                    }
                  />
                  <label htmlFor="isResident" className="text-sm">
                    I am a Gig Harbor area resident
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Personal Comments: Share why saving rural Gig Harbor matters to you 
                    (will be forwarded to Pierce County)
                  </label>
                  <Textarea
                    name="comments"
                    value={formData.comments}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full"
                    placeholder="Tell us why preserving rural Gig Harbor is important to you..."
                  />
                </div>
                
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full text-lg py-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing Petition...' : 'Sign the Petition'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="mb-16 fade-in-up">
          <Card className="nature-card forest-shadow">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-6 text-primary">
                Three Ways to Save Rural Gig Harbor
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Badge variant="secondary" className="text-lg px-4 py-2">1</Badge>
                  <h3 className="font-semibold">Sign this petition</h3>
                  <p className="text-sm text-muted-foreground">
                    Join 100+ neighbors fighting for our community
                  </p>
                </div>
                <div className="space-y-3">
                  <Badge variant="secondary" className="text-lg px-4 py-2">2</Badge>
                  <h3 className="font-semibold">Include personal comments</h3>
                  <p className="text-sm text-muted-foreground">
                    Tell Pierce County why rural character matters
                  </p>
                </div>
                <div className="space-y-3">
                  <Badge variant="secondary" className="text-lg px-4 py-2">3</Badge>
                  <h3 className="font-semibold">Attend the hearing</h3>
                  <p className="text-sm text-muted-foreground">
                    Show up in person to make your voice heard. More details at{' '}
                    <a href="https://tinyurl.com/4dy4xc84" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      https://tinyurl.com/4dy4xc84
                    </a>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="mb-4">
            All signatures and comments will be compiled and submitted to Tony Kantas, 
            Pierce County Planning Office, before the August 10th deadline. For more information, email stopkensingtongardens@gmail.com.
          </p>
          <div className="flex justify-center items-center gap-2 text-sm opacity-75">
            <TreePine className="h-4 w-4" />
            <span>Save Rural Gig Harbor</span>
          </div>
        </div>
      </footer>
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-3xl max-h-full overflow-auto" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute top-2 right-2 text-white text-3xl font-bold bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center"
              onClick={closeImageModal}
            >
              &times;
            </button>
            <img src={selectedImage} alt="Enlarged view" className="max-w-full max-h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}

export default App

